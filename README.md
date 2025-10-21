https://nodejs.org/ko/download
위 사이트에서 node.js부터 설치

1. vscode에서 파일 > 폴더열기 
	- 해당경로 열기

2. node.js 초기화
	$ npm init -y
		* npm init은 Node.js 프로젝트를 초기화하는 명령어입니다.
		* -y 플래그는 package.json 파일 생성 시 모든 질문에 'yes'로 답변하여 기본값으로 빠르게 파일을 생성하도록 돕습니다.

3. Express.js 설치 (서버 구축)
	$ npm install express

4.  Socket.IO 설치 (실시간 통신)
	$ npm install socket.io

5. 실행
	$ node app.js

6. 접속
	http://localhost:3000


최초 실행되는 js파일은 package.json > main 부분에서 설정한다.


node.js > jwt 사용
npm install jsonwebtoken

node.js > 환경변수 env 파일로 관리할수 있게함
npm install dotenv



```
=====================================================
--------------------프로젝트 구조---------------------
=====================================================
project/
│── app.js              # 서버 실행 (메인 엔트리)
│── package.json
│
├── socket/             # 소켓 관련 로직
│    └── chatSocket.js
│
├── controller/        # 컨트롤러 (HTTP 요청 처리)
│    └── chatController.js
│
├── route/             # 라우터 정의
│    └── chatRoutes.js
│
├── view/              # HTML/EJS 등 뷰
│    └── chat.html
│    └── main.html
│
└── public/             # 정적 파일(css, js 등)
```

```
// 랜덤 키 생성하기
function generateRandomKey() {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 16; i++) {
    	result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
	return result;
}
```
