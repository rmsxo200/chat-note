# CSS 변경 작업 내역

## 왼쪽 메뉴 탭 및 그리기 기능 이동

### 추가된 클래스

#### `.chat-layout`
- `display: flex`, `height: 100%`, `overflow: hidden`
- 전체 채팅 화면을 감싸는 flex 컨테이너

#### `.sidebar-strip`
- 항상 표시되는 탭 아이콘 영역 (데스크톱: 왼쪽 48px 세로 바)
- `background: #222`, `border-right: 1px solid #333`

#### `.sidebar-tab-btn`
- 탭 아이콘 버튼 (36×36px, 둥근 테두리)
- `.active` 상태: `border-color: #4ecdc4`, `background: #2a4a49`

#### `.sidebar-panel`
- 열고 닫히는 콘텐츠 패널
- 기본값: `width: 0`, `overflow: hidden`
- 열릴 때 (`.open`): `width: 400px`, `transition: width 0.3s ease`

#### `.chat-main`
- 채팅 메시지 + 입력폼 영역
- `flex: 1`, `display: flex`, `flex-direction: column`, `min-width: 0`

---

### 수정된 클래스

#### `#form`
- `position: fixed` 제거 → flex 하단 고정 방식으로 변경
- `flex-shrink: 0`, `border-top: 1px solid #2a2a2a` 추가

#### `#messages`
- `flex: 1`, `overflow-y: auto` 추가 (flex 컨테이너 내 스크롤)

#### `.drawing-panel`
- `drawing-overlay` 래퍼 제거에 따라 스타일 재정의
- `width: 100%`, `box-sizing: border-box`, `padding: 0.75rem`

---

### 삭제된 클래스

#### `.drawing-overlay`
- 기존 모달 오버레이 스타일 제거 (사이드바 패널로 대체)

#### `#draw-toggle-btn`
- 메시지 입력창 내 ✏️ 토글 버튼 스타일 제거 (사이드바 탭으로 역할 이전)

---

### 모바일 반응형 (`@media max-width: 768px`)

| 클래스 | 변경 내용 |
|---|---|
| `.chat-layout` | `flex-direction: column` (세로 배치) |
| `.chat-main` | `order: 1` (상단), `min-height: 0` |
| `.sidebar-panel` | `order: 2` (중단), `width: 100%`, `max-height: 0 → 55vh` 슬라이드 애니메이션 |
| `.sidebar-panel.open` | `max-height: 55vh`, `overflow-y: auto` |
| `.sidebar-strip` | `order: 3` (하단 바), `width: 100%`, `height: 48px`, 가로 방향 전환 |
| `.drawing-toolbar` | `flex-wrap: wrap`, `gap: 0.4rem` (좁은 화면 줄바꿈) |
| `.draw-btn` | `flex: 1` (버튼 균등 분배) |

**데스크톱**: 탭 클릭 → 왼쪽 패널 400px 너비로 슬라이드
**모바일**: 탭 클릭 → 하단에서 55vh 높이로 슬라이드 업

---

### 전역 스타일 변경

```css
/* 변경 전 */
body {
  padding-bottom: 3rem; /* fixed form 대응용 */
}

/* 변경 후 */
html, body, #root {
  height: 100%;
  margin: 0;
}
```

