# 회고모임

친구들과 매주 `이번주 회고`와 `다음주 플랜`을 작성하는 GitHub Pages용 정적 웹앱입니다.

## 구성

- `index.html`: 앱 화면
- `design-system.css`: yoonchulyi.com 기반 디자인 토큰과 기본 컴포넌트
- `styles.css`: 회고 앱 전용 레이아웃
- `app.js`: 게시판, 작성 폼, 필터, 저장소 연결 로직
- `data/posts.json`: 게시글 아카이브
- `DESIGN_SYSTEM.md`: 디자인 시스템 요약

## 디자인 시스템

`/Users/yoonchul/dev/yoonchulyi.com`의 디자인 언어를 정적 CSS 토큰으로 옮겼습니다.

- 배경: `#F4F4F0`
- 본문: `#191919`
- 보조 텍스트: `#8C8C8C`
- 포인트 컬러: `#EA580C`
- 타이포: `Newsreader` serif + `IBM Plex Mono`
- 레이아웃: `max-width: 42rem`, 얇은 구분선, 카드보다 리스트 중심

토큰과 기본 컴포넌트는 `design-system.css`, 회고 앱 전용 조합은 `styles.css`에 있습니다.

## 저장 방식: 레포 JSON 아카이브

게시글은 이 레포의 `data/posts.json`에 배열 형태로 아카이빙됩니다.

- 기본 읽기: GitHub Pages가 배포한 `data/posts.json`을 읽습니다.
- 임시 저장: GitHub 설정 전에는 브라우저 `localStorage`에 저장됩니다.
- 공유 저장: GitHub owner/repo/branch/path/token을 설정하면 글 작성/편집/삭제 시 GitHub API로 `data/posts.json`에 커밋합니다.

토큰은 사이트 서버가 아니라 각자의 브라우저 `localStorage`에만 저장됩니다. 그래도 브라우저에 토큰을 넣는 방식이므로 fine-grained token을 만들고, 이 저장소의 `Contents: Read and write` 권한만 부여하세요.

## JSON 스키마

`data/posts.json`은 게시글 배열입니다. 한 게시글 안에 이번주 회고와 다음주 플랜을 함께 저장합니다.

```json
[
  {
    "id": "uuid",
    "type": "weekly",
    "author": "윤철",
    "weekOf": "2026-07-19",
    "title": "이번주 회고",
    "content": {
      "reflection": {
        "wins": "좋았던 점",
        "challenges": "어려웠던 점",
        "learnings": "배운 점"
      },
      "plan": {
        "goals": "목표",
        "actions": "실행 계획",
        "support": "필요한 도움"
      }
    },
    "commitment": "한 줄 다짐",
    "createdAt": "2026-07-19T00:00:00.000Z"
  }
]
```

## GitHub Pages 배포

1. 이 폴더를 GitHub 저장소로 push합니다.
2. GitHub 저장소 `Settings > Pages`로 이동합니다.
3. `Deploy from a branch`를 선택합니다.
4. `main` 브랜치와 `/root`를 선택합니다.

별도 빌드 단계는 없습니다.
