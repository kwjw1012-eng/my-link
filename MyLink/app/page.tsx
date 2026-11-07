import Link from "next/link";
import { courseLinks, courseProfile } from "@/lib/profile";

const features = [
  ["01", "링크 관리", "흩어진 링크를 한곳에 모으고, 필요할 때 추가하거나 수정하세요."],
  ["02", "클릭 통계", "총 클릭 수와 링크별 클릭 수를 마이페이지에서 확인하세요."],
  ["03", "개인 URL", "기억하기 쉬운 주소 하나로 내 페이지를 공유하세요."],
];

export default function HomePage() {
  return <main className="shell landing">
    <header className="page-header masthead"><Link className="brand" href="/">◈ MYLINK</Link><Link className="text-button" href="/login">시작하기 ↗</Link></header>
    <section className="hero" aria-labelledby="hero-title">
      <div><p className="eyebrow">LINK IN BIO · 바이브 코딩</p>
        <h1 id="hero-title">나를 소개하는<br /><em>단 하나의 링크.</em></h1>
        <p className="hero-copy">프로필과 프로젝트를 나만의 페이지에 모으고, 어떤 링크가 관심을 받는지 확인해 보세요.</p>
        <div className="actions"><Link className="button" href="/login">내 마이링크 만들기 ↗</Link><Link className="button secondary" href={`/${courseProfile.username}`}>공개 프로필 보기</Link></div>
      </div>
      <div className="preview panel" aria-label="마이링크 예시 화면">
        <span className="eyebrow">PUBLIC PROFILE</span><div className="avatar">K</div>
        <h2>{courseProfile.name}</h2><p>{courseProfile.bio}</p>
        {courseLinks.map(link => <span className="preview-link" key={link.id}>{link.title}<span>↗</span></span>)}
      </div>
    </section>
    <section className="feature-grid" aria-label="마이링크 주요 기능">
      {features.map(([number, title, description]) => <article key={number} className="panel feature"><p className="eyebrow">{number}</p><h2>{title}</h2><p>{description}</p></article>)}
    </section>
    <section className="page-header callout"><div><h2>내 페이지를 공유해 보세요.</h2><p>링크를 모아 첫 번째 마이링크를 만들어 보세요.</p></div><Link className="button" href="/login">나도 만들어보기 ↗</Link></section>
    <footer className="page-header footer"><span>아이디어를 현실로 · 바이브 코딩</span><a href="https://github.com/kwjw1012-eng/my-link">GitHub 소스 코드 ↗</a></footer>
  </main>;
}
