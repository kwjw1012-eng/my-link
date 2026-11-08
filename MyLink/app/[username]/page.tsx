import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProfileCard from "../profile-card";
import { getPublicProfile } from "./profile-data";

export async function generateMetadata({ params }: PageProps<"/[username]">): Promise<Metadata> {
  const { username } = await params;
  const data = await getPublicProfile(username);
  if (!data) return { title: "페이지를 찾을 수 없습니다", robots: { index: false } };
  const { profile } = data;
  const title = `마이링크 · ${profile.name}`;
  const description = profile.bio || `${profile.name}님의 링크 모음`;
  return { title, description, alternates: { canonical: `/${username}` }, openGraph: { title, description, url: `/${username}` } };
}

export default async function PublicPage({ params }: PageProps<"/[username]">) {
  const { username } = await params;
  const data = await getPublicProfile(username);
  if (!data) notFound();
  return <ProfileCard key={data.profile.uid} profile={data.profile} initialLinks={data.links} trackClicks={data.trackClicks} />;
}
