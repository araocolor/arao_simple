# ARAO Simple — 프로젝트 가이드

## 프로젝트 개요

검은 배경의 미니멀 웹사이트. 랜딩페이지 + 관리자 페이지로 구성.
Firebase Firestore로 데이터 관리, Firebase Authentication으로 로그인, Vercel로 배포.

---

## 배포 URL

- **라이브**: https://araosimple.vercel.app
- **어드민**: https://araosimple.vercel.app/admin.html
- **GitHub**: https://github.com/araocolor/arao_simple

---

## 파일 구조

```
arao_simple/
├── server.js          # Express 서버 (API + Firebase Admin)
├── vercel.json        # Vercel 배포 설정
├── seed.js            # Firestore 초기 데이터 (이미 실행 완료)
├── design.md          # 디자인 시스템 정의
├── package.json       # 의존성 (express, firebase-admin, dotenv)
├── .env               # 환경변수 (로컬용, GitHub에 올라가지 않음)
├── .gitignore
└── public/
    ├── index.html     # 랜딩페이지
    ├── admin.html     # 관리자 페이지 (로그인 + 편집)
    ├── script.js      # 클라이언트 JavaScript
    └── style.css      # 스타일 (디자인 시스템 적용)
```

---

## 기술 스택

| 항목 | 기술 |
|------|------|
| 서버 | Node.js + Express |
| 데이터베이스 | Firebase Firestore |
| 인증 | Firebase Authentication (Email/Password) |
| 배포 | Vercel |
| 코드 관리 | GitHub |

---

## 환경변수 (.env)

```
PORT=3000
FIREBASE_PROJECT_ID=araosimple
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="..."
```

> JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD는 Firebase Auth 전환으로 삭제됨

---

## Vercel 환경변수 (대시보드에 설정)

| Key | 설명 |
|-----|------|
| `FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID |
| `FIREBASE_CLIENT_EMAIL` | 서비스 계정 이메일 |
| `FIREBASE_PRIVATE_KEY` | 서비스 계정 비공개 키 |

---

## API 엔드포인트

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| POST | `/api/logout` | 없음 | 로그아웃 (클라이언트 처리) |
| GET | `/api/sections` | 없음 | 섹션 목록 조회 |
| PUT | `/api/sections/:id` | Firebase Auth | 섹션 수정 |

---

## Firestore 구조

컬렉션: `sections`

```
sections/
├── 1  →  { id: 1, title: "Welcome", content: "..." }
├── 2  →  { id: 2, title: "About", content: "..." }
└── 3  →  { id: 3, title: "Contact", content: "..." }
```

---

## 로컬 개발

```bash
# 서버 시작 (백그라운드)
npm start &

# 브라우저에서 확인
http://localhost:3000
http://localhost:3000/admin.html
```

---

## 배포 방법

코드 수정 후:
```bash
git add .
git commit -m "변경 내용 설명"
git push
```

push 하면 Vercel이 자동으로 배포합니다.

---

## 관리자 로그인 변경 방법

Firebase 콘솔에서 관리:
https://console.firebase.google.com/project/araosimple/authentication/users

- 비밀번호 변경: 해당 사용자 → 메뉴 → 비밀번호 재설정
- 사용자 추가/삭제: 동일 페이지에서 관리

---

## 오늘 작업 이력

1. 기본 웹사이트 구축 (Express + 인메모리 데이터)
2. 디자인 시스템 적용 (design.md 기반 — Primary #2F88FB, Plus Jakarta Sans, Inter)
3. Firebase Firestore 연동 (데이터 영속화)
4. JWT 인증 구현 후 Firebase Authentication으로 교체
5. Vercel 배포 설정 (vercel.json)
6. 로딩 UI — 페이지 가운데 얇은 막대 애니메이션
7. GitHub 연동 및 자동 배포 파이프라인 구성
