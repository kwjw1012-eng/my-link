"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cloudEnabled } from "@/lib/firebase";
import { readDemo, writeDemo } from "@/lib/demo";
import { type Profile, type ProfileLink } from "@/lib/profile";

export default function ProfileCard({ profile, initialLinks }: { profile: Profile; initialLinks: ProfileLink[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [notice, setNotice] = useState("");
  const localDemo = profile.uid === "demo" && !cloudEnabled;

  useEffect(() => {
    if (!localDemo) return;
    const refresh = () => setLinks(readDemo());
    const initial = setTimeout(refresh, 0);
    window.addEventListener("storage", refresh);
    return () => { clearTimeout(initial); window.removeEventListener("storage", refresh); };
  }, [localDemo]);

  function record(id: string) {
    if (localDemo) {
      const current = readDemo().map(link => link.id === id ? { ...link, clickCount: link.clickCount + 1 } : link);
      writeDemo(current);
      setLinks(current);
    } else if (profile.uid !== "demo") {
      void fetch("/api/click", { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
        body: JSON.stringify({ username: profile.username, id }) })
        .then(response => { if (!response.ok) setNotice("링크는 열렸지만 클릭 수를 저장하지 못했어요."); })
        .catch(() => setNotice("링크는 열렸지만 클릭 수를 저장하지 못했어요."));
    }
  }

  return <main className="narrow panel public-profile">
    <Link href="/" className="eyebrow">◈ MYLINK</Link>
    <div className="avatar" aria-hidden="true">{profile.name.slice(0, 1)}</div>
    <h1>{profile.name}</h1><p className="eyebrow">@{profile.username}</p><p>{profile.bio}</p>
    {links.length ? <ul className="stack">{links.map(link => <li key={link.id}>
      <a className="preview-link" href={link.url} target="_blank" rel="noopener noreferrer" onClick={() => record(link.id)}>{link.title}<span aria-hidden="true">↗</span></a>
    </li>)}</ul> : <p className="muted">아직 공개한 링크가 없어요.</p>}
    {notice && <p className="muted" role="status">{notice}</p>}
  </main>;
}
