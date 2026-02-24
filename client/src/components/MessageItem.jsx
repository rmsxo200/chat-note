export default function MessageItem({ message }) {
  // 유저 상태 메시지 (입장/퇴장)
  if (message.type === 'state') {
    return (
      <li style={{ color: message.stateType === 'in' ? 'white' : 'red' }}>
        {message.message}
      </li>
    );
  }

  // 축하 키워드 체크
  const celebrationKeywords = ['축하', 'ㅊㅋ', '퇴근', '연차', '반차', '퇴사'];
  const hasCelebration = celebrationKeywords.some((kw) =>
    message.msg.includes(kw)
  );

  return (
    <>
      <li
        className={message.isMine ? 'my-message' : 'other-message'}
        style={{ color: message.color }}
      >
        [{message.user}] : {message.msg}
      </li>
      {hasCelebration && (
        <li className={message.isMine ? 'my-message' : 'other-message'}>
          🎉🎉🎉
        </li>
      )}
    </>
  );
}
