import { sampleLinks, type ProfileLink } from "./profile";

const demoKey = "mylink-demo-links";
export const demoSessionKey = "mylink-demo-active";

export function readDemo(): ProfileLink[] {
  const stored = localStorage.getItem(demoKey);
  return stored ? JSON.parse(stored) : sampleLinks;
}

export function writeDemo(links: ProfileLink[]) {
  localStorage.setItem(demoKey, JSON.stringify(links));
}
