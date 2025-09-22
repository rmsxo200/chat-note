// 필요한 모듈들을 불러옵니다.
const express = require("express");           // 웹 서버를 구축하기 위한 Express 프레임워크
const http = require("http");                 // HTTP 서버를 생성하기 위한 Node.js 내장 모듈
const { Server } = require("socket.io");      // 실시간 양방향 통신을 위한 Socket.IO 서버
const path = require("path");                 // 파일 경로를 다루기 위한 Node.js 내장 모듈

// Express 애플리케이션과 HTTP 서버를 생성합니다.
const app = express();        
const server = http.createServer(app);

// HTTP 서버에 Socket.IO를 연결하여 실시간 통신 기능을 추가합니다.
const io = new Server(server);

// 서버가 실행될 포트 번호를 설정합니다.
const port = 3000;

// ================== 미들웨어 설정 ==================
app.use(express.json());                      // 요청 본문(JSON)을 파싱하는 미들웨어
app.use(express.static("public"));            // public 폴더를 정적 파일 제공 경로로 지정 (css, js 등)

// ================== 라우터 설정 ==================
const chatRoutes = require("./route/chatRoutes"); // 채팅 라우터 불러오기
app.use("/", chatRoutes);                           // "/" 경로에 라우터 연결

// ================== 소켓 이벤트 설정 ==================
require("./socket/chatSocket")(io);          // chatSocket.js 불러와서 io 전달 (소켓 이벤트 처리)

// ================== 서버 실행 ==================
server.listen(port, () => {                   // 지정된 포트에서 서버 실행
  console.log(`listening on *:${port}`);      // 서버 실행 확인 메시지 출력
});