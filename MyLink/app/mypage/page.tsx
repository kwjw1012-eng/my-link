"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { cloudEnabled, createProfile, deleteLink, getSession, readLinks, readProfile, saveLink, sessionKey } from "@/lib/firebase";
import { demoSessionKey, readDemo, writeDemo } from "@/lib/demo";
import { sampleProfile, validUsername, webUrl, type Profile, type ProfileLink } from "@/lib/profile";

export default function MyPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [editing, setEditing] = useState<ProfileLink | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      if (!cloudEnabled) {
        if (!sessionStorage.getItem(demoSessionKey)) { router.replace("/login"); return; }
        setProfile(sampleProfile);
        setLinks(readDemo());
        setAuthorized(true);
        return;
      }
      const session = await getSession();
      if (!session) { router.replace("/login"); return; }
      const current = await readProfile(session.localId, session.idToken);
      const saved = current ? await readLinks(session.localId, session.idToken) : [];
      setProfile(current);
      setLinks(saved);
      setAuthorized(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "마이페이지를 불러올 수 없습니다.");
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => {
    const refresh = () => { if (document.visibilityState === "visible") void load(); };
    const initial = setTimeout(() => void load(), 0);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("storage", refresh);
    return () => { clearTimeout(initial); document.removeEventListener("visibilitychange", refresh); window.removeEventListener("storage", refresh); };
  }, [load]);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try { await action(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "변경 내용을 저장할 수 없습니다."); }
    finally { setBusy(false); }
  }

  async function requireSession() {
    const session = await getSession();
    if (!session) { router.replace("/login"); throw new Error("다시 로그인해 주세요."); }
    return session;
  }

  function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    void run(async () => {
      const username = String(fields.get("username")).trim().toLowerCase();
      const name = String(fields.get("name")).trim();
      const bio = String(fields.get("bio")).trim();
      if (!validUsername(username) || !name) throw new Error("표시 이름과 사용 가능한 주소를 입력해 주세요.");
      const session = await requireSession();
      await createProfile({ uid: session.localId, username, name, bio }, session.idToken);
      await load();
    });
  }

  function submitLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    void run(async () => {
      const title = String(fields.get("title")).trim();
      if (!title) throw new Error("링크 제목을 입력해 주세요.");
      const link = { id: editing?.id ?? crypto.randomUUID(), title, url: webUrl(String(fields.get("url")).trim()), clickCount: 0 };
      if (cloudEnabled) {
        const session = await requireSession();
        await saveLink(session.localId, link, Boolean(editing), session.idToken);
      } else {
        const current = readDemo();
        writeDemo(editing ? current.map(item => item.id === link.id ? { ...link, clickCount: item.clickCount } : item) : [...current, link]);
      }
      form.reset();
      setEditing(null);
      await load();
    });
  }

  function remove(id: string) {
    void run(async () => {
      if (cloudEnabled) {
        const session = await requireSession();
        await deleteLink(session.localId, id, session.idToken);
      } else writeDemo(readDemo().filter(link => link.id !== id));
      if (editing?.id === id) setEditing(null);
      setRemoving(null);
      await load();
    });
  }

  function signOut() {
    sessionStorage.removeItem(sessionKey);
    sessionStorage.removeItem(demoSessionKey);
    router.replace("/login");
  }

  const ranked = [...links].sort((a, b) => b.clickCount - a.clickCount || a.title.localeCompare(b.title));
  const total = links.reduce((sum, link) => sum + link.clickCount, 0);

  return <main className="shell stack dashboard">
    <header className="page-header"><div><Link href="/" className="eyebrow">MYLINK STUDIO</Link><h1>마이페이지</h1></div>
      {authorized && <button type="button" className="text-button" onClick={signOut}>{cloudEnabled ? "로그아웃" : "체험 종료"}</button>}
    </header>
    {error && <p className="error" role="alert">{error}</p>}
    {loading && <p role="status">불러오는 중…</p>}
    {!loading && !authorized && error && <button className="button" onClick={() => void load()}>다시 시도</button>}
    {authorized && !profile && <section className="panel"><h2>개인 페이지 만들기</h2>
      <form className="stack" onSubmit={submitProfile}>
        <label>개인 주소<input name="username" placeholder="my-name" required pattern="[a-zA-Z0-9][a-zA-Z0-9\-]{2,23}" minLength={3} maxLength={24} /></label>
        <small>영문과 숫자, 하이픈으로 3~24자</small>
        <label>표시 이름<input name="name" required maxLength={60} /></label>
        <label>한 줄 소개<textarea name="bio" maxLength={200} rows={3} /></label>
        <button className="button" disabled={busy}>개인 페이지 만들기</button>
      </form></section>}
    {profile && <>
      <div className="panel page-header"><div><strong>{profile.name}</strong><p className="muted">{cloudEnabled ? `/${profile.username}` : "브라우저에만 저장되는 체험 모드"}</p></div>
        <Link className="button secondary" href={`/${profile.username}`} target="_blank" rel="noopener">개인 페이지 ↗</Link></div>
      <section className="panel stack"><h2>링크 관리</h2>
        <form key={editing?.id ?? "new"} className="stack" onSubmit={submitLink}>
          <label>제목<input name="title" maxLength={80} defaultValue={editing?.title} required /></label>
          <label>주소<input name="url" type="url" placeholder="https://" defaultValue={editing?.url} required /></label>
          <div className="actions"><button className="button" disabled={busy}>{editing ? "변경 저장" : "링크 추가"}</button>
            {editing && <button className="button secondary" type="button" onClick={() => setEditing(null)} disabled={busy}>취소</button>}</div>
        </form>
        {links.length === 0 && <p className="muted">아직 링크가 없어요. 첫 번째 링크를 추가해 보세요.</p>}
        <ul className="stack">{links.map(link => <li className="link-row" key={link.id}>
          <div><strong>{link.title}</strong><small>{link.url}</small></div>
          <div className="actions">{removing === link.id ? <>
            <button className="text-button danger" disabled={busy} onClick={() => remove(link.id)}>삭제 확인</button>
            <button className="text-button" disabled={busy} onClick={() => setRemoving(null)}>취소</button>
          </> : <><button className="text-button" disabled={busy} onClick={() => setEditing(link)}>수정</button>
            <button className="text-button danger" disabled={busy} onClick={() => setRemoving(link.id)}>삭제</button></>}</div>
        </li>)}</ul>
      </section>
      <section className="panel stack"><div className="page-header"><h2>클릭 통계</h2><button className="text-button" disabled={busy} onClick={() => void load()}>새로고침</button></div>
        <p className="stat"><strong>{total.toLocaleString("ko-KR")}</strong> 총 클릭</p>
        <ol className="stack">{ranked.map(link => <li key={link.id} className="link-row"><strong>{link.title}</strong><span>{link.clickCount.toLocaleString("ko-KR")} 클릭</span></li>)}</ol>
        {ranked.length === 0 && <p className="muted">링크를 추가하면 링크별 통계가 표시돼요.</p>}
      </section>
    </>}
  </main>;
}
