# 회고모임 디자인 시스템

이 디자인 시스템은 `/Users/yoonchul/dev/yoonchulyi.com`의 시각 언어를 기준으로 만든 정적 CSS 버전입니다.

## 원본에서 가져온 원칙

- 좁은 본문 폭: `max-width: 42rem`
- 배경은 따뜻한 회색, 표면 카드는 최소화
- 헤딩과 본문은 serif, 메타/내비/버튼은 mono
- 강조는 orange 한 가지를 일관되게 사용
- 구분은 그림자보다 얇은 border 중심
- 큰 장식보다 글의 리듬과 여백을 우선

## 토큰

토큰은 `design-system.css`의 `:root`에 정의합니다.

- `--ds-color-bg`: `#F4F4F0`
- `--ds-color-text`: `#191919`
- `--ds-color-sub`: `#8C8C8C`
- `--ds-color-accent`: `#EA580C`
- `--ds-font-serif`: `Newsreader`
- `--ds-font-mono`: `IBM Plex Mono`
- `--ds-shell`: `42rem`

## 기본 클래스

- `.ds-shell`: 사이트 본문 폭과 좌우 여백
- `.ds-kicker`: 작은 mono 메타 라벨
- `.ds-link-accent`: 강조 텍스트 링크
- `.ds-link-muted`: 보조 텍스트 링크
- `.ds-button`: 주요 액션 버튼
- `.ds-button-secondary`: 보조 버튼
- `.ds-panel`: 얇은 상하 구분선을 가진 패널

## 앱 레이어

`styles.css`는 앱 전용 조합만 담당합니다. 색상, 폰트, 폭, 버튼 기본값은 직접 만들지 않고 `design-system.css` 토큰을 사용합니다.
