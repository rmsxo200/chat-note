const xorKey = 'aaa%kiPsVkS@UC!5';

// XOR + Base64 암호화 함수
export function xorBase64Encrypt(text) {
  const utf8Text = unescape(encodeURIComponent(text));

  let xorResult = '';
  for (let i = 0; i < utf8Text.length; i++) {
    const textChar = utf8Text.charCodeAt(i);
    const keyChar = xorKey.charCodeAt(i % xorKey.length);
    xorResult += String.fromCharCode(textChar ^ keyChar);
  }

  return btoa(xorResult);
}

// XOR + Base64 복호화 함수
export function xorBase64Decrypt(encrypted) {
  const base64Decoded = atob(encrypted);

  let xorResult = '';
  for (let i = 0; i < base64Decoded.length; i++) {
    const encChar = base64Decoded.charCodeAt(i);
    const keyChar = xorKey.charCodeAt(i % xorKey.length);
    xorResult += String.fromCharCode(encChar ^ keyChar);
  }

  return decodeURIComponent(escape(xorResult));
}
