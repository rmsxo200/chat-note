const express = require("express");                   // Express 불러오기
const router = express.Router();                      // 라우터 객체 생성
const chatController = require("../controller/chatController"); // 컨트롤러 불러오기

/*********************** HTTP 요청 처리 관련 ***************************/
// 클라이언트의 HTTP 요청을 처리합니다. (GET, POST 등)
router.get("/", chatController.getIndex);             // "/" → index.html 반환
router.get("/chat", chatController.getChat);          // "/chat" → chat.html 반환
router.post("/login", chatController.login);          // "/login" → 로그인 처리

module.exports = router;                              // 라우터 export