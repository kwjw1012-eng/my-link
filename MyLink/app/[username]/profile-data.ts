import { cache } from "react";
import { cloudEnabled, findProfile, readLinks } from "@/lib/firebase";
import { courseLinks, courseProfile, sampleLinks, sampleProfile, validUsername } from "@/lib/profile";

export const getPublicProfile = cache(async (username: string) => {
  if (username === sampleProfile.username) {
    return { profile: sampleProfile, links: sampleLinks, trackClicks: false };
  }
  if (!validUsername(username)) return null;

  const profile = cloudEnabled ? await findProfile(username) : null;
  if (profile) {
    return { profile, links: await readLinks(profile.uid), trackClicks: true };
  }
  return username === courseProfile.username
    ? { profile: courseProfile, links: courseLinks, trackClicks: false }
    : null;
});
