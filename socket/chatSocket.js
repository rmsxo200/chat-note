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
    console.log("a user connected"); // 새 사용자가 접속했음을 서버 콘솔에 출력합니다.

    // 클라이언트의 연결 종료 이벤트를 감지합니다.
    socket.on("disconnect", () => {                   
      console.log("user disconnected"); // 사용자가 연결을 끊었음을 서버 콘솔에 출력합니다.
      userColors.delete(socket.name); // 폰트 색상 map에서 삭제

      // 나가는 사람을 제외한 나머지 유저에게 메시지 전송
      socket.broadcast.emit("userState", {            
        type: "out",
        message: socket.name + "님이 나가셨습니다.",
      });
    });

    // 클라이언트가 'chatMessage'라는 이벤트로 메시지를 보낼 때를 감지합니다.
    socket.on("chatMessage", (data) => {
      // 받은 메시지(data)를 연결된 모든 클라이언트에게 'chatMessage' 이벤트로 다시 보냅니다.
      // io.emit()은 자신을 포함한 모든 클라이언트에게 메시지를 전송합니다.
      data.color = userColors.get(data.user); // 메시지 내용에 폰트색상 추가
      io.emit("chatMessage", data);
    });

    // 클라이언트가 'newUser'라는 이벤트를 보낼 때를 감지합니다.
    socket.on("newUser", (name) => {
      socket.name = name; // 클라이언트로부터 받은 이름을 소켓에 저장해두기

      /* 배열에서 순서대로 색상을 할당하고 인덱스를 증가시킵니다. */
      userColors.set(name, COLORS[colorIndex]); // 폰트 색상 map에 저장
      colorIndex = (colorIndex + 1) % COLORS.length; // 배열의 끝에 도달하면 다시 0으로 돌아갑니다.

      io.sockets.emit("userState", {
        type: "in",
        message: name + "님이 접속하였습니다.",
      });
    });
  });
};