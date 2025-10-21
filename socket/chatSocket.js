module.exports = (io) => { // 모듈 export (io를 매개변수로 받음)

  // 메시지 색상 배열
  const COLORS = [
    '#F1D70B', // 노란색
    '#1B8FFF', // 하늘색
    '#6A9955', // 초록색
    '#CE834D', // 주황색
    '#A465D6'  // 보라색
  ];

  // 현재 할당할 색상의 인덱스
  let colorIndex = 0;

  // 사용자별 폰트 컬러
  let userColors = new Map();

  // Socket.IO 연결 이벤트를 감지합니다. 클라이언트가 접속하면 이 코드가 실행됩니다.
  io.on("connection", (socket) => {
    console.log(`User ${socket.user} connected`); // 새 사용자가 접속했음을 서버 콘솔에 출력합니다.

    // 클라이언트의 연결 종료 이벤트를 감지합니다.
    socket.on("disconnect", () => {
      console.log(`User ${socket.user} disconnected`); // 사용자가 연결을 끊었음을 서버 콘솔에 출력합니다.
      userColors.delete(socket.user); // 폰트 색상 map에서 삭제

      // 유저가 나간 방에만 메시지를 보냅니다.
      socket.broadcast.to(socket.room).emit("userState", {
        type: "out",
        message: socket.user + "님이 나가셨습니다.",
      });
    });

    // 클라이언트가 'chatMessage'라는 이벤트로 메시지를 보낼 때를 감지합니다.
    socket.on("chatMessage", (data) => {
      const user = socket.user;
      const room = socket.room;

      // 받은 메시지(data)를 연결된 클라이언트에게 'chatMessage' 이벤트로 다시 보냅니다.            
      io.to(room).emit("chatMessage", { // 메시지를 보낸 클라이언트가 속한 방에만 메시지를 보냅니다.
        user: user,
        msg: data.msg,
        color: userColors.get(user) // 메시지 내용에 폰트색상 추가
      });
    });

    // 클라이언트가 'joinRoom'라는 이벤트를 보낼 때를 감지합니다.
    socket.on("joinRoom", (data) => {
      // 1. 소켓에 사용자의 닉네임과 방 이름을 저장합니다.
      const user = socket.user; // 서버가 저장한 socket.user 사용 ( app.js에서 jwt 토큰에 담긴 값을 socket에 담음)
      const room = data.room;
      socket.room = room;

      // 2. 소켓을 해당 방에 참가시킵니다.
      //    * io.emit()은 연결된 모든 클라이언트에게 메시지를 보냅니다. 마치 넓은 강당에서 확성기로 말하는 것과 같습니다.
      //    * socket.join()은 채팅방, 게임 팀, 화상 회의 그룹 등 여러 사용자를 그룹화해야 하는 모든 실시간 애플리케이션에 필수적인 기능입니다.
      socket.join(room);

      // 3. 폰트 색상을 할당하고 맵에 저장합니다.
      userColors.set(user, COLORS[colorIndex]); // 폰트 색상 map에 저장
      colorIndex = (colorIndex + 1) % COLORS.length; // 배열의 끝에 도달하면 다시 0으로 돌아갑니다.

      // 4. 해당 방에 있는 모든 클라이언트에게 입장 메시지를 보냅니다.
      io.to(room).emit("userState", {
        type: "in",
        message: user + "님이 접속하였습니다.",
      });
    });
  });
};