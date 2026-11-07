import { type Profile, type ProfileLink } from "./profile";

const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
export const cloudEnabled = Boolean(project && apiKey);
const database = `projects/${project}/databases/(default)/documents`;
const endpoint = `https://firestore.googleapis.com/v1/${database}`;

type Field = { stringValue?: string; integerValue?: string };
type Fields = Record<string, Field>;
type Document = { name: string; fields: Fields };
type Session = { localId: string; idToken: string; refreshToken: string; expiresIn: string };
export const sessionKey = "mylink-session";

export async function firebaseLogin(email: string, password: string, register: boolean) {
  const method = register ? "signUp" : "signInWithPassword";
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${method}?key=${apiKey}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  if (!response.ok) throw new Error(register ? "가입하지 못했습니다. 이메일과 비밀번호를 확인해 주세요." : "로그인하지 못했습니다. 이메일과 비밀번호를 확인해 주세요.");
  const session: Session = await response.json();
  saveSession(session);
}

function saveSession(session: Session) {
  sessionStorage.setItem(sessionKey, JSON.stringify({ ...session, expiresAt: Date.now() + Number(session.expiresIn) * 1000 }));
}

export async function getSession(): Promise<Session | null> {
  const stored = sessionStorage.getItem(sessionKey);
  if (!stored) return null;
  const session: Session & { expiresAt: number } = JSON.parse(stored);
  if (session.expiresAt > Date.now() + 60_000) return session;
  const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${apiKey}`, {
    method: "POST",
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: session.refreshToken }),
  });
  if (!response.ok) {
    if (response.status >= 500) throw new Error("로그인 확인에 실패했습니다. 다시 시도해 주세요.");
    sessionStorage.removeItem(sessionKey);
    return null;
  }
  const result = await response.json();
  const refreshed = { localId: result.user_id, idToken: result.id_token, refreshToken: result.refresh_token, expiresIn: result.expires_in };
  saveSession(refreshed);
  return refreshed;
}

async function firestore<T>(path: string, token?: string, init?: RequestInit): Promise<T | null> {
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init?.body) headers.set("Content-Type", "application/json");
  const response = await fetch(`${endpoint}${path}`, { ...init, headers, cache: "no-store" });
  if (response.status === 404 && (!init?.method || init.method === "GET")) return null;
  if (!response.ok) throw new Error("데이터를 저장하거나 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
  return response.json() as Promise<T>;
}

const str = (stringValue: string): Field => ({ stringValue });
const number = (value: number): Field => ({ integerValue: String(value) });

export async function readProfile(uid: string, token?: string): Promise<Profile | null> {
  const result = await firestore<Document>(`/users/${encodeURIComponent(uid)}`, token);
  if (!result) return null;
  const { username, name, bio } = result.fields;
  return { uid, username: username?.stringValue ?? "", name: name?.stringValue ?? "", bio: bio?.stringValue ?? "" };
}

export async function findProfile(username: string) {
  const result = await firestore<Document>(`/usernames/${encodeURIComponent(username)}`);
  const uid = result?.fields.uid?.stringValue;
  return uid ? readProfile(uid) : null;
}

export async function createProfile(profile: Profile, token: string) {
  const { uid, username, name, bio } = profile;
  if (await firestore<Document>(`/usernames/${encodeURIComponent(username)}`)) throw new Error("이미 사용 중인 주소입니다.");
  await firestore(":commit", token, {
    method: "POST",
    body: JSON.stringify({ writes: [
      { update: { name: `${database}/usernames/${username}`, fields: { uid: str(uid) } }, currentDocument: { exists: false } },
      { update: { name: `${database}/users/${uid}`, fields: { username: str(username), name: str(name), bio: str(bio) } }, currentDocument: { exists: false } },
    ] }),
  });
}

export async function readLinks(uid: string, token?: string): Promise<ProfileLink[]> {
  const links: ProfileLink[] = [];
  let cursor = "";
  do {
    const collection = token ? "links" : "publicLinks";
    const pagination = new URLSearchParams({ pageSize: "100" });
    if (cursor) pagination.set("pageToken", cursor);
    const page = await firestore<{ documents?: Document[]; nextPageToken?: string }>(`/users/${encodeURIComponent(uid)}/${collection}?${pagination}`, token);
    for (const entry of page?.documents ?? []) {
      links.push({ id: entry.name.split("/").pop()!, title: entry.fields.title.stringValue ?? "", url: entry.fields.url.stringValue ?? "", clickCount: Number(entry.fields.clickCount?.integerValue ?? 0) });
    }
    cursor = page?.nextPageToken ?? "";
  } while (cursor);
  return links;
}

export async function saveLink(uid: string, link: ProfileLink, editing: boolean, token: string) {
  const fields: Fields = { title: str(link.title), url: str(link.url) };
  await firestore(":commit", token, { method: "POST", body: JSON.stringify({ writes: ["links", "publicLinks"].map(collection => ({
    update: { name: `${database}/users/${uid}/${collection}/${link.id}`, fields: !editing && collection === "links" ? { ...fields, clickCount: number(0) } : fields },
    currentDocument: { exists: editing },
    ...(editing ? { updateMask: { fieldPaths: ["title", "url"] } } : {}),
  })) }) });
}

export async function deleteLink(uid: string, id: string, token: string) {
  await firestore(":commit", token, { method: "POST", body: JSON.stringify({ writes: ["links", "publicLinks"].map(collection => ({
    delete: `${database}/users/${uid}/${collection}/${id}`,
  })) }) });
}

export async function countClick(uid: string, id: string, token: string) {
  await firestore(":commit", token, { method: "POST", body: JSON.stringify({ writes: [{
    transform: { document: `${database}/users/${uid}/links/${id}`, fieldTransforms: [{ fieldPath: "clickCount", increment: number(1) }] },
    currentDocument: { exists: true },
  }] }) });
}
