export type Profile = { uid: string; username: string; name: string; bio: string };
export type ProfileLink = { id: string; title: string; url: string; clickCount: number };

export const sampleProfile: Profile = {
  uid: "demo",
  username: "demo",
  name: "마이링크 실습",
  bio: "바이브 코딩으로 만든 프로젝트와 소스 코드를 모아 두는 공간입니다.",
};

export const courseLinks: ProfileLink[] = [
  { id: "github", title: "GitHub 프로필", url: "https://github.com/kwjw1012-eng", clickCount: 0 },
  { id: "source", title: "마이링크 소스 코드", url: "https://github.com/kwjw1012-eng/my-link", clickCount: 0 },
];

export const courseProfile: Profile = {
  uid: "course-profile",
  username: "kwjw1012-eng",
  name: "윤중석",
  bio: "바이브 코딩 견습생",
};

export const courseProfilePath = `/${courseProfile.username}`;

export const validUsername = (value: string) => /^[a-z0-9][a-z0-9-]{2,23}$/.test(value)
  && !["api", "demo", "login", "mypage", courseProfile.username].includes(value);

export function webUrl(value: string) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.href.length > 2000) {
    throw new Error("http 또는 https로 시작하는 링크를 입력해 주세요.");
  }
  return url.href;
}
