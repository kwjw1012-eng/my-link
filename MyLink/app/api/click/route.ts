import { cloudEnabled, countClick, findProfile } from "@/lib/firebase";
import { getServiceToken } from "@/lib/firebase-server";
import { validUsername } from "@/lib/profile";

export async function POST(request: Request) {
  if (!cloudEnabled) return new Response(null, { status: 503 });
  if (request.headers.get("sec-fetch-site") === "cross-site") return new Response(null, { status: 403 });
  const data = await request.json().catch(() => null);
  const { username, id } = data ?? {};
  if (typeof username !== "string" || !validUsername(username) || typeof id !== "string" || !/^[\da-f-]{36}$/.test(id)) {
    return new Response(null, { status: 400 });
  }
  try {
    const profile = await findProfile(username);
    if (!profile) return new Response(null, { status: 404 });
    await countClick(profile.uid, id, await getServiceToken());
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 503 });
  }
}
