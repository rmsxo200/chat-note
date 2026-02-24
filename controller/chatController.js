const jwt = require("jsonwebtoken");              // JWT 모듈 추가
const JWT_SECRET = "KkKkK00@*&#@753TYEye#^^-=00"; // 비밀키 설정

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
