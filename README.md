# Chat-Note

JWT 인증 기반 실시간 그룹 채팅 애플리케이션

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **백엔드** | Node.js + Express 5 + Socket.IO |
| **프론트엔드** | React 19 + Vite + React Router |
| **인증** | JWT (jsonwebtoken) |
| **실시간 통신** | Socket.IO (WebSocket) |

---

## 프로젝트 구조

```
chat-note/
├── app.js                      # 서버 진입점 (Express + Socket.IO + JWT)
├── package.json
├── controller/
│   └── chatController.js       # 로그인 API 컨트롤러
├── route/
│   └── chatRoutes.js           # POST /login 라우트
├── socket/
│   └── chatSocket.js           # Socket.IO 이벤트 핸들러
│
├── client/                     # React 프론트엔드 (Vite)
│   ├── vite.config.js          # 프록시 설정
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx             # React Router (/ → /room → /chat)
│       ├── pages/
│       │   ├── LoginPage.jsx   # 로그인
│       │   ├── RoomPage.jsx    # 채팅방 선택
│       │   └── ChatPage.jsx    # 채팅
│       ├── components/
│       │   ├── MessageList.jsx
│       │   ├── MessageItem.jsx
│       │   ├── MessageInput.jsx
│       │   └── Fireworks.jsx   # 축하 불꽃놀이 효과
│       ├── hooks/
│       │   └── useSocket.js    # Socket.IO 커스텀 훅
│       ├── utils/
│       │   └── crypto.js       # XOR + Base64 암호화
│       └── styles/
│           └── App.css
│
├── CHANGES.md                  # 변경사항 상세 문서
└── README.md
```

---

## 새 PC에서 세팅하기

### 1. 사전 준비 — Node.js 설치

https://nodejs.org/ko/download 에서 Node.js LTS 버전을 설치합니다.

설치 확인:
```bash
node -v
npm -v
```

### 2. 프로젝트 클론

```bash
git clone <저장소 URL>
cd chat-note
```

### 3. 백엔드 의존성 설치

```bash
npm install
```

설치되는 패키지: `express`, `socket.io`, `jsonwebtoken`, `cors`

### 4. 프론트엔드 의존성 설치

```bash
cd client
npm install
cd ..
```

설치되는 패키지: `react`, `react-dom`, `react-router-dom`, `socket.io-client`

### 5. 실행 방법 선택

#### 방법 A: 개발 모드 (터미널 2개)

코드 수정 시 자동 반영(Hot Reload)되어 개발에 적합합니다.

**터미널 1 — 백엔드 (포트 3000)**
```bash
npm run dev
```

**터미널 2 — 프론트엔드 (포트 5173)**
```bash
cd client
npm run dev
```

접속: http://localhost:5173

#### 방법 B: 프로덕션 모드 (터미널 1개)

React를 빌드하여 Express 서버 1개로 통합 실행합니다.

```bash
npm run build        # React 빌드 (client/dist 생성)
npm start            # 프로덕션 서버 실행
```

접속: http://localhost:3000

### 개발 vs 프로덕션 비교

| 항목 | 개발 모드 | 프로덕션 모드 |
|------|-----------|---------------|
| 터미널 | 2개 (백엔드 + Vite) | 1개 (Express만) |
| 접속 주소 | `localhost:5173` | `localhost:3000` |
| Hot Reload | O | X (빌드 필요) |
| 용도 | 코드 수정/디버깅 | 실제 배포/운영 |

---

## npm 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 백엔드 개발 서버 실행 (포트 3000) |
| `npm run build` | React 프론트엔드 빌드 (client/dist) |
| `npm start` | 프로덕션 모드 통합 실행 (포트 3000) |

---

## 사용 흐름

```
로그인 (/) → 채팅방 선택 (/room) → 채팅 (/chat)
```

1. 닉네임과 입장 구호를 입력하여 로그인
2. 채팅방 이름을 입력 (빈칸이면 '기본방')
3. 실시간 채팅 시작
4. 축하 키워드 입력 시 불꽃놀이 효과 발동 (`축하`, `ㅊㅋ`, `퇴근`, `연차`, `반차`, `퇴사`)

---

## 참고

- 변경 이력 및 상세 설명: [CHANGES.md](./CHANGES.md)
