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
│       │   ├── DrawingCanvas.jsx   # 개인 그림 그리기 (채팅으로 전송)
│       │   ├── SharedCanvas.jsx    # 실시간 공유 캔버스
│       │   └── Fireworks.jsx       # 축하 불꽃놀이 효과
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

## 왼쪽 사이드바 메뉴

채팅 화면 왼쪽에 항상 표시되는 탭 스트립이 있습니다.
아이콘을 클릭하면 해당 도구 패널이 열리고, 같은 아이콘을 다시 클릭하면 닫힙니다.

| 아이콘 | 기능 | 설명 |
|--------|------|------|
| ✏️ | 내 그림 그리기 | 혼자 그린 뒤 채팅으로 이미지 전송 |
| 🎨 | 공유 캔버스 | 채팅방 참여자 전원과 실시간으로 함께 그리기 |

### 반응형 동작

| 환경 | 탭 위치 | 패널 열리는 방향 |
|------|---------|-----------------|
| 데스크톱 (769px~) | 화면 왼쪽 세로 바 | 오른쪽으로 400px 펼쳐짐 |
| 모바일 (768px 이하) | 화면 하단 가로 바 | 위쪽으로 55vh 올라옴 |

---

## ✏️ 개인 그림 그리기 (`DrawingCanvas`)

혼자 그린 그림을 채팅 메시지로 전송하는 기능입니다.

### 도구

| 도구 | 설명 |
|------|------|
| 색상 팔레트 | 9가지 색상 선택 (흰/빨/주/노/초/하/보/분/검) |
| 지우개 | 브러시 크기의 3배 굵기로 지우기 |
| 브러시 크기 | 슬라이더로 1~30px 조절 |

### 버튼

| 버튼 | 동작 |
|------|------|
| 전체 지우기 | 캔버스를 초기 배경색으로 리셋 |
| 닫기 | 패널 닫기 (그림 내용 유지되지 않음) |
| 전송 | 현재 캔버스를 PNG 이미지로 채팅에 전송 후 패널 닫기 |

### 구현 파일

- [`client/src/components/DrawingCanvas.jsx`](client/src/components/DrawingCanvas.jsx) — 컴포넌트
- 캔버스 크기: 600×400 (CSS `max-width: 100%`로 화면에 맞게 축소)
- 마우스 및 터치 이벤트 모두 지원 (`onTouchStart/Move/End`, `touch-action: none`)
- 전송 시 `canvas.toDataURL('image/png')`로 Base64 이미지 생성 → Socket.IO `chatMessage` 이벤트로 전송

---

## 🎨 공유 캔버스 (`SharedCanvas`)

채팅방 참여자 전원이 **동시에** 같은 캔버스 위에 그림을 그리는 기능입니다.
한 명이 획을 그으면 나머지 참여자의 화면에 **즉시** 반영됩니다.

### 도구

✏️ 개인 그리기와 동일한 도구 (색상 팔레트, 지우개, 브러시 크기 슬라이더)

### 버튼

| 버튼 | 동작 |
|------|------|
| 전체 지우기 | 내 화면 초기화 + 모든 참여자 화면도 동시에 초기화 |
| 닫기 | 패널 닫기 (캔버스 상태는 서버에 저장되지 않음) |

> **주의**: 전송 버튼 없음 — 그리는 즉시 실시간으로 공유됩니다.

### 실시간 동기화 구조

```
내가 그리기 → 로컬 캔버스에 즉시 렌더링
            → Socket.IO drawStroke 이벤트 전송
              └→ 서버 broadcast (송신자 제외)
                  └→ 다른 참여자 수신 → 각자 캔버스에 렌더링
```

### 소켓 이벤트

| 이벤트 | 페이로드 | 설명 |
|--------|---------|------|
| `drawStroke` (획) | `{ type: 'stroke', from: {x,y}, to: {x,y}, color, size, tool }` | 선 한 구간 전송 |
| `drawStroke` (지우기) | `{ type: 'clear' }` | 전체 지우기 동기화 |

### 반짝임 알림

다른 참여자가 공유 캔버스에 그림을 그리면, 현재 해당 탭을 열지 않은 참여자의 🎨 아이콘이 **반짝이며 알림**을 표시합니다.

- 알림 조건: `type === 'stroke'` 수신 + 공유 캔버스 탭 미확인 상태
- 알림 해제: 🎨 탭 아이콘 클릭 시 즉시 소등

### 구현 파일

- [`client/src/components/SharedCanvas.jsx`](client/src/components/SharedCanvas.jsx) — 컴포넌트
- [`client/src/hooks/useSocket.js`](client/src/hooks/useSocket.js) — `sendDrawStroke`, `registerDrawStrokeHandler`, `registerDrawNotifyHandler`
- [`socket/chatSocket.js`](socket/chatSocket.js) — `drawStroke` 이벤트 브로드캐스트

---

## 참고

- 변경 이력 및 상세 설명: [CHANGES.md](./CHANGES.md)
- CSS 작업 이력: [CHANGES_CSS.md](./CHANGES_CSS.md)
