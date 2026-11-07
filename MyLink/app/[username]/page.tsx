import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cloudEnabled, findProfile, readLinks } from "@/lib/firebase";
import { sampleLinks, sampleProfile, validUsername } from "@/lib/profile";
import ProfileCard from "../profile-card";

const profileFor = cache(async (username: string) => {
  if (username === "demo") return sampleProfile;
  return cloudEnabled && validUsername(username) ? findProfile(username) : null;
});

export async function generateMetadata({ params }: PageProps<"/[username]">): Promise<Metadata> {
  const { username } = await params;
  const profile = await profileFor(username);
  if (!profile) return { title: "페이지를 찾을 수 없습니다", robots: { index: false } };
  const title = `마이링크 · ${profile.name}`;
  const description = profile.bio || `${profile.name}님의 링크 모음`;
  return { title, description, alternates: { canonical: `/${username}` }, openGraph: { title, description, url: `/${username}` } };
}

export default async function PublicPage({ params }: PageProps<"/[username]">) {
  const { username } = await params;
  const profile = await profileFor(username);
  if (!profile) notFound();
  const links = profile.uid === "demo" ? sampleLinks : await readLinks(profile.uid);
  return <ProfileCard profile={profile} initialLinks={links} />;
}
