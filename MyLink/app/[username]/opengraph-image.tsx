import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { cloudEnabled, findProfile, readLinks } from "@/lib/firebase";
import { sampleLinks, sampleProfile, validUsername } from "@/lib/profile";

export const alt = "MyLink profile preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = username === "demo" ? sampleProfile : cloudEnabled && validUsername(username) ? await findProfile(username) : null;
  if (!profile) notFound();
  const links = profile.uid === "demo" ? sampleLinks : await readLinks(profile.uid);
  const font = /[^\u0000-\u007f]/.test(profile.name + profile.bio)
    ? await fetch("https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/SubsetOTF/KR/NotoSansKR-Regular.otf", { signal: AbortSignal.timeout(2500), next: { revalidate: 86400 } })
      .then(response => response.ok ? response.arrayBuffer() : null).catch(() => null)
    : null;
  const title = font || /^[\u0000-\u007f]*$/.test(profile.name) ? profile.name : `@${username}`;
  const bio = font || /^[\u0000-\u007f]*$/.test(profile.bio) ? profile.bio : "One profile. All your links.";
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", background: "#5B5FC7", color: "white", padding: 80, ...(font ? { fontFamily: "Noto" } : {}) }}>
    <div style={{ display: "flex", fontSize: 28, letterSpacing: 6 }}>MYLINK / PROFILE</div>
    <div style={{ display: "flex", fontSize: 68, marginTop: 40 }}>{title.slice(0, 30)}</div>
    <div style={{ display: "flex", fontSize: 32, marginTop: 16 }}>{bio.slice(0, 65)}</div>
    <div style={{ display: "flex", fontSize: 26, marginTop: 42, background: "#45489E", padding: "12px 22px", borderRadius: 30, alignSelf: "flex-start" }}>@{username} · {links.length} LINKS</div>
  </div>, { ...size, fonts: font ? [{ name: "Noto", data: font }] : undefined });
}
