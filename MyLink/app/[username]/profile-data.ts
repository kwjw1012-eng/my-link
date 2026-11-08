import { cache } from "react";
import { cloudEnabled, findProfile, readLinks } from "@/lib/firebase";
import { courseLinks, courseProfile, sampleProfile, validUsername } from "@/lib/profile";

export const getPublicProfile = cache(async (username: string) => {
  if (username === courseProfile.username) {
    return { profile: courseProfile, links: courseLinks, trackClicks: false };
  }
  if (username === sampleProfile.username) {
    return { profile: sampleProfile, links: courseLinks, trackClicks: false };
  }
  if (!cloudEnabled || !validUsername(username)) return null;

  const profile = await findProfile(username);
  if (!profile) return null;
  return { profile, links: await readLinks(profile.uid), trackClicks: true };
});
