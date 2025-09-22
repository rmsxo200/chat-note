const path = require("path");                                     // 파일 경로 처리를 위한 path 모듈 불러오기

// 메인 페이지 컨트롤러
exports.getIndex = (req, res) => {                                // "/" 요청 처리
  // 요청이 들어오면 'main.html' 파일을 클라이언트에 보냅니다.
  // path.join()을 사용해 현재 디렉토리(__dirname)와 파일명을 결합합니다.
  res.sendFile(path.join(__dirname, "../view/main.html"));      // index.html 반환
};

// 채팅 페이지 컨트롤러
exports.getChat = (req, res) => {                                 // "/chat" 요청 처리
  res.sendFile(path.join(__dirname, "../view/chat.html"));       // chat.html 반환
};

// 로그인 처리 컨트롤러
exports.login = (req, res) => {                                   // "/login" 요청 처리
  const { password } = req.body;                                  // 요청 본문에서 password 추출

  try {
    const isMatch = password === "xhlrms";                        // 입력된 비밀번호 검증
    if (isMatch) { 
      res.status(200).json({ message: "입장 성공!" });            // 비밀번호가 맞으면 200 응답 전송
    } else {
      res.status(401).json({ message: "구호가 일치하지 않습니다." }); // 틀리면 401 응답 전송
    }
  } catch (error) {                                               // 예외 처리
    res.status(500).json({ message: "서버 오류" });               // 500 응답 전송
  }
};