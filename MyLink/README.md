# 마이링크 (MyLink)

「아이디어를 현실로 - 바이브 코딩」 실습 프로젝트입니다. 공개 프로필에 KWJW의 소개와 GitHub 링크를 모았습니다.

[KWJW의 공개 마이링크](https://my-link-lyart.vercel.app/kwjw1012-eng)

## 실행

```sh
npm ci
npm run dev
```

브라우저에서 http://localhost:3000 을 열면 공개 프로필로 이동합니다.

| 주소 | 화면 |
| --- | --- |
| `/` | KWJW의 공개 프로필로 이동 |
| `/kwjw1012-eng` | 제출용 공개 프로필과 링크 카드 |
| `/demo` | 개발 중 브라우저 체험용 프로필 |
| `/login`, `/mypage` | 개발 중 체험하거나 Firebase 연결 후 사용하는 관리 기능 |

개발 중 체험에서 추가한 링크와 클릭 수는 해당 브라우저에 저장됩니다. 공개 배포에서 이전 체험 주소는 KWJW의 프로필로 연결됩니다. 관리 기능은 Firebase 설정을 적용한 배포에서 사용할 수 있습니다.

## Firebase와 Vercel 연결

1. 이 프로젝트 전용 Firebase 프로젝트를 준비하고 Firebase Authentication의 **이메일/비밀번호** 로그인과 Cloud Firestore를 켭니다. Firebase 웹 앱 설정에서 프로젝트 ID와 웹 API 키를 확인합니다.
2. 전용 Firestore 프로젝트에 `firestore.rules`를 적용합니다. 공개 링크와 소유자 전용 통계를 분리합니다.
3. 클릭 집계에 사용할 전용 서비스 계정에 Cloud Datastore User 권한을 부여합니다. 서비스 계정 이메일과 비공개 키는 Vercel의 서버 환경 변수에만 넣습니다.
4. GitHub 저장소에 프로젝트를 `MyLink` 폴더로 올린 후 Vercel에서 저장소를 가져옵니다. 프레임워크는 Next.js, **Root Directory**는 `MyLink`를 선택합니다.
5. 아래 값을 설정하고 배포합니다. 앱에서 계정을 만들고 개인 페이지를 생성한 뒤, 다른 브라우저에서 링크를 열어 클릭 통계를 확인합니다.

| 환경 변수 | 값 |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase 웹 앱 API 키 |
| `FIREBASE_SERVICE_ACCOUNT_EMAIL` | 클릭 집계 전용 서비스 계정 이메일 |
| `FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY` | 서버에서만 사용하는 서비스 계정 비공개 키 |
| `MYLINK_SITE_URL` | 공개 사이트 주소. Vercel 기본 운영 주소가 설정되어 있으면 생략 가능 |

## 클릭 저장 방식

공개 페이지의 링크는 새 탭에서 열립니다. 원래 페이지는 서버에 클릭을 알리고, 서버가 Firestore의 숫자 증가 연산으로 `users/{uid}/links/{id}`의 `clickCount`에 1을 더합니다. 마이페이지에서만 전체 통계와 링크별 순위를 표시합니다. 일반 방문자도 클릭할 수 있도록 공개 페이지의 방문자 로그인은 요구하지 않습니다.

[MIT 라이선스](LICENSE)
