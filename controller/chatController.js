const path = require("path");                                     // 파일 경로 처리를 위한 path 모듈 불러오기
const jwt = require("jsonwebtoken");              // JWT 모듈 추가
const JWT_SECRET = "KkKkK00@*&#@753TYEye#^^-=00"; // 비밀키 설정

// 메인 페이지 컨트롤러
exports.getIndex = (req, res) => {                                // "/" 요청 처리
  // 요청이 들어오면 'main.html' 파일을 클라이언트에 보냅니다.
  // path.join()을 사용해 현재 디렉토리(__dirname)와 파일명을 결합합니다.
  res.sendFile(path.join(__dirname, "../view/main.html"));      // index.html 반환
};

// 채팅 페이지 컨트롤러
exports.getChat = (req, res, next) => {                                 // "/chat" 요청 처리
  // 1. 요청 헤더에서 Referer 값을 가져옵니다.
  const referer = req.headers.referer; 
  const ALLOWED_REFERER_PATH = '/';
  
  // 2. Referer가 존재하는지 확인합니다.
  if (!referer) {
      console.warn(`[ACCESS DENIED] Direct access attempt to /chat (No Referer).`);
      const error = new Error("잘못된 접근입니다. 메인 페이지를 통해 접속해주세요.");
      error.status = 403; // Forbidden
      return next(error);
  }

  try {
      // 3. Referer URL을 파싱하여 경로만 추출합니다.
      const refererUrl = new URL(referer);
      const refererPath = refererUrl.pathname;
      
      // 4. Referer 경로가 허용된 경로와 일치하는지 확인합니다.
      if (refererPath === ALLOWED_REFERER_PATH) {
          // 일치하면 chat.html 파일 전송 허용
          res.sendFile(path.join(__dirname, "../view/chat.html"));       // chat.html 반환
      } else {
          // 일치하지 않으면 접근 거부
          console.warn(`[ACCESS DENIED] Invalid Referer Path: ${refererPath}`);
          const error = new Error("접근 경로가 유효하지 않습니다. 메인 페이지에서 이동해야 합니다.");
          error.status = 403; // Forbidden
          next(error);
      }

  } catch (error) {
      // URL 파싱 오류 등 예외 발생 시 처리
      console.error("Error processing Referer URL:", error);
      const customError = new Error("접근 권한 확인 중 오류가 발생했습니다.");
      customError.status = 500;
      next(customError);
  }
};

// 로그인 처리 컨트롤러
exports.login = (req, res) => {                                   // "/login" 요청 처리
  const { password, user } = req.body;                            // 요청 본문에서 password, 닉네임 추출

  try {
    const isMatch = password === "xhlrms";                        // 입력된 비밀번호 검증
    if (isMatch) { 
      // 1. 로그인 성공 시 JWT 토큰 발급 (토큰에 유저 닉네임 저장)
      const token = jwt.sign({ user: user }, JWT_SECRET, { expiresIn: '1h' }); 

      // 2. 토큰을 응답 본문에 포함하여 200 응답 전송
      res.status(200).json({ message: "입장 성공!", token: token, user: user });
    } else {
      res.status(401).json({ message: "구호가 일치하지 않습니다." }); // 틀리면 401 응답 전송
    }
  } catch (error) {                                               // 예외 처리
    console.error(error);
    res.status(500).json({ message: "서버 오류" });               // 500 응답 전송
  }
};