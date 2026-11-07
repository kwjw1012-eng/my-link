"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { cloudEnabled, firebaseLogin } from "@/lib/firebase";
import { demoSessionKey } from "@/lib/demo";

export default function LoginPage() {
  const router = useRouter();
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await firebaseLogin(String(fields.get("email")), String(fields.get("password")), register);
      router.replace("/mypage");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "로그인할 수 없습니다.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="narrow panel">
    <Link href="/" className="eyebrow">MYLINK</Link>
    <h1>{cloudEnabled ? (register ? "마이링크 가입" : "마이링크 로그인") : "마이링크 체험"}</h1>
    {cloudEnabled ? <>
      <p>나만의 공개 페이지와 링크 통계를 관리하세요.</p>
      <form onSubmit={login} className="stack">
        <label>이메일<input name="email" type="email" autoComplete="email" required /></label>
        <label>비밀번호<input name="password" type="password" autoComplete={register ? "new-password" : "current-password"} minLength={6} required /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="button" disabled={busy}>{busy ? "처리 중…" : register ? "가입하기" : "로그인"}</button>
      </form>
      <button className="text-button" type="button" onClick={() => { setRegister(!register); setError(""); }}>{register ? "로그인 화면으로" : "이메일로 가입하기"}</button>
    </> : <>
      <p>이 브라우저에서 링크 관리와 클릭 집계를 체험할 수 있어요. 체험에서 수정한 데이터는 이 브라우저에만 저장됩니다.</p>
      <button className="button" onClick={() => { sessionStorage.setItem(demoSessionKey, "1"); router.replace("/mypage"); }}>체험 시작하기</button>
    </>}
  </main>;
}
