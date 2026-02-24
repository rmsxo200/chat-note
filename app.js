/*
  올바른 순서 (Must-Have Order):
    1.시스템 핸들러 (process.on): Node.js 프로세스 전체 오류 처리.
    2.일반 미들웨어 (app.use(json), app.use(urlencoded)).
    3.라우터 정의 (app.use("/", chatRoutes)).
    4.404 핸들러 (app.use((req, res, next) => { next(404); })).
    5.전역 오류 핸들러 (app.use((err, req, res, next) => { ... })) 👈 반드시 가장 마지막!

    Express는 들어오는 모든 HTTP 요청을 처리하기 위해 app.use() 또는 app.get(), app.post() 등으로 정의된 모든 함수들을 코드에 작성된 순서대로, 위에서부터 아래로 실행합니다.
    그렇기에 오류 핸들러가 라우터보다 아래에 있어야 한다.
    또 전역 오류 핸들러는 모든 라우터 및 404 처리 미들웨어 뒤로 와야된다.
*/

// 필요한 모듈들을 불러옵니다.
const express = require("express");           // 웹 서버를 구축하기 위한 Express 프레임워크
const http = require("http");                 // HTTP 서버를 생성하기 위한 Node.js 내장 모듈
const { Server } = require("socket.io");      // 실시간 양방향 통신을 위한 Socket.IO 서버
const path = require("path");                 // 파일 경로를 다루기 위한 Node.js 내장 모듈
const cors = require("cors");                 // CORS 미들웨어 (React 클라이언트 허용)
const jwt = require("jsonwebtoken");              // JWT 모듈 추가

// 실행 모드 (development / production)
const NODE_ENV = process.env.NODE_ENV || "development";

const JWT_SECRET = "KkKkK00@*&#@753TYEye#^^-=00"; // 비밀키 설정

// Express 애플리케이션과 HTTP 서버를 생성합니다.
const app = express();        
const server = http.createServer(app);

// HTTP 서버에 Socket.IO를 연결하여 실시간 통신 기능을 추가합니다.
const io = new Server(server, {
  cors: NODE_ENV === "development"
    ? { origin: "http://localhost:5173", methods: ["GET", "POST"] } // 개발: Vite 허용
    : undefined  // 프로덕션: 같은 origin이므로 CORS 불필요
});

// 서버가 실행될 포트 번호를 설정합니다.
const port = 3000;

// =========================================================================
// 프로세스 Exception 핸들러
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 치명적인 오류가 발생했습니다. ');
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    // Note: 실제 서비스에서는 이 후 process.exit(1)을 호출하여 서버를 재시작하는 것이 안전합니다.
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION! 처리되지 않은 비동기 오류 발생.');
    console.error('Reason:', reason);
});
// =========================================================================

// ================== 미들웨어 설정 ==================
if (NODE_ENV === "development") {
  app.use(cors({ origin: "http://localhost:5173" })); // 개발: React 개발 서버 CORS 허용
}
app.use(express.json());                      // 요청 본문(JSON)을 파싱하는 미들웨어

// ================== 라우터 설정 ==================
const chatRoutes = require("./route/chatRoutes"); // 채팅 라우터 불러오기
app.use("/", chatRoutes);                           // "/" 경로에 라우터 연결

// ================== Socket.IO 설정 ==================
// Socket.IO 미들웨어: JWT를 검증하고 사용자 정보를 소켓에 저장
io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        // 토큰 없음: 연결 거부
        return next(new Error("인증 토큰이 없습니다."));
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // 토큰 유효: 사용자 정보를 소켓에 저장 (매우 중요!)
        socket.user = decoded.user; 
        next();
    } catch (error) {
        // 토큰 만료/위조: 연결 거부
        return next(new Error("유효하지 않거나 만료된 토큰입니다."));
    }
});

// ================== 소켓 이벤트 설정 ==================
require("./socket/chatSocket")(io);          // chatSocket.js 불러와서 io 전달 (소켓 이벤트 처리)

// ================== 프로덕션: React 정적 파일 서빙 ==================
if (NODE_ENV === "production") {
  // React 빌드 파일 서빙 (client/dist)
  app.use(express.static(path.join(__dirname, "client/dist")));

  // API 라우트가 아닌 모든 요청은 React의 index.html로 전달 (SPA 라우팅)
  // Express 5에서는 "*" 대신 named wildcard "{*path}" 사용
  app.get("{*path}", (req, res) => {
    res.sendFile(path.join(__dirname, "client/dist/index.html"));
  });
}

// ================== 404 Not Found 핸들러 ==================
app.use((req, res, next) => {
    const error = new Error(`404 Not Found: Cannot ${req.method} ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

// ================== Express 전역 오류 핸들러 ==================
// HTTP 요청/응답 주기 오류 감지 및 응답 간소화
app.use((err, req, res, next) => {
    const status = err.status || 500;
    
    // 1. 서버 콘솔에는 상세 에러 로깅 (개발자용)
    console.error('================================================================');
    console.error('EXPRESS GLOBAL ERROR CAUGHT!');
    console.error(`Time: ${new Date().toISOString()}`);
    console.error(`Method: ${req.method}, Path: ${req.originalUrl}`);
    console.error(`Status: ${status}`);
    console.error('Error Message:', err.message);
    console.error('Error Stack:', err.stack); // 스택은 서버 콘솔에만 출력
    console.error('================================================================');
    
    // 2. 클라이언트에게는 간소화된 JSON 응답 전송 (사용자용)
    res.status(status).json({
        success: false,
        message: err.message || '서버 내부 오류가 발생했습니다. (Internal Server Error)',
    });
});

// ================== 서버 실행 ==================
server.listen(port, () => {                   // 지정된 포트에서 서버 실행
  console.log(`[${NODE_ENV}] listening on *:${port}`);
});