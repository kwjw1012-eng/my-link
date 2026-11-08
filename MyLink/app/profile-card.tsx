"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cloudEnabled } from "@/lib/firebase";
import { readDemo, writeDemo } from "@/lib/demo";
import { courseProfile, sampleProfile, type Profile, type ProfileLink } from "@/lib/profile";

function LinkIcon({ id }: { id: string }) {
  return <span className="profile-link-icon" aria-hidden="true">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" focusable="false">
      {id === "github" ? <><path d="M6 8v8m12-8a6 6 0 0 1-6 6H6" /><circle cx="6" cy="5" r="3" /><circle cx="18" cy="5" r="3" /><circle cx="6" cy="19" r="3" /></>
        : id === "source" ? <path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16" />
          : <path d="M10 13a4 4 0 0 0 6 .5l3-3a4 4 0 0 0-5.7-5.7l-1.7 1.7m2.4 4.5a4 4 0 0 0-6-.5l-3 3a4 4 0 0 0 5.7 5.7l1.7-1.7" />}
    </svg>
  </span>;
}

export default function ProfileCard({ profile, initialLinks, trackClicks }: { profile: Profile; initialLinks: ProfileLink[]; trackClicks: boolean }) {
  const [links, setLinks] = useState(initialLinks);
  const [notice, setNotice] = useState("");
  const localDemo = profile.uid === sampleProfile.uid && !cloudEnabled;
  const isCourseProfile = profile.uid === courseProfile.uid;
  const displayedLinks = localDemo ? links : initialLinks;

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
    } else if (trackClicks) {
      void fetch("/api/click", { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
        body: JSON.stringify({ username: profile.username, id }) })
        .then(response => { if (!response.ok) setNotice("링크는 열렸지만 클릭 수를 저장하지 못했어요."); })
        .catch(() => setNotice("링크는 열렸지만 클릭 수를 저장하지 못했어요."));
    }
  }

  return <main className="profile-screen">
    <div className="public-profile">
      <header>
        <div className="profile-avatar" aria-hidden="true">{Array.from(profile.name).slice(0, isCourseProfile ? 2 : 1).join("")}</div>
        <h1>{profile.name}</h1>
        <p className="profile-handle">@{profile.username}</p>
        {profile.bio && <p className="profile-bio">{profile.bio}</p>}
      </header>
      {displayedLinks.length ? <ul className="profile-links" aria-label="공개 링크">
        {displayedLinks.map(link => <li key={link.id}>
          <a className="profile-link" href={link.url} target="_blank"
            rel="noopener noreferrer" onClick={() => record(link.id)}>
            <LinkIcon id={link.id} />
            <span>{link.title}</span>
            <span className="profile-link-arrow" aria-hidden="true">↗</span>
          </a>
        </li>)}
      </ul> : <p className="profile-empty">아직 공개한 링크가 없어요.</p>}
      {notice && <p className="profile-empty" role="status">{notice}</p>}
      <footer className="profile-footer">
        {isCourseProfile ? "MyLink · 바이브 코딩" : <Link href="/">마이링크 홈</Link>}
      </footer>
    </div>
  </main>;
}
