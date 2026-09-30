# 🧬 에듀심 (EduSim) — 인터랙티브 3D 인체 해부학 탐색기

> **원작자**: [Deep Gori](https://github.com/deepgori/edusim) | **한글화**: [sigco3111](https://github.com/sigco3111)
>
> 원본 저장소: [deepgori/edusim](https://github.com/deepgori/edusim) — 본 저장소는 원본의 모든 기능을 유지하면서 한국어로 인터페이스와 콘텐츠를 현지화한 한글화 포크입니다.

**Three.js** 와 바닐라 **JavaScript / HTML / CSS** 로 제작된 인터랙티브 3D 인체 해부학 탐색기입니다. 프레임워크, 빌드 도구, 패키지 관리자 없이 브라우저만 있으면 동작합니다.

- 🌐 **라이브 데모**: 본 저장소 상단의 GitHub Pages URL에서 바로 확인
- 📦 **모델 출처**: [Z-Anatomy](https://www.z-anatomy.com/) (CC BY-SA 4.0) + HuBMAP CCF 3D Reference Library의 장기 모델

---

## ✨ 주요 기능

### 🫀 3D 인체 해부학 탐색기

- Z-Anatomy의 **GLTF / DRACO 모델**을 그대로 사용 (200개 이상의 해부학적 구조물)
- **근육 / 뼈 / 장기** 레이어를 독립적으로 토글
- 구조물을 클릭하면 **상세 의학 정보 + 한국어 위키백과 링크** 표시
- **X-레이 모드**: 외층을 투명하게 비추어 내부 확인
- **내부 보기 모드**: 근육을 반투명 처리해 뼈와 장기가 비치도록
- 통합 **검색**: 한국어·영어 식별자로 구조물 빠른 찾기
- 구조물을 따라다니는 **플로팅 3D 라벨**

### 📊 학습자 진도 대시보드

- **Chart.js** 기반 4종 시각화
  - 시간에 따른 학습 진도 (라인 차트)
  - 신체 시스템 탐색률 (도넛 차트)
  - 탐색에 사용한 시간 (막대 차트)
  - 인체 해부학 역량 프로필 (레이더 차트)
- `localStorage` 기반 **세션 추적 / 영구화**
- 핵심 지표: 총 세션 수, 총 학습 시간, 평균 점수, 완료율
- 학습 목표 추적기 + 실시간 알림 시스템

---

## 🧱 기술 스택

| 계층 | 사용 기술 | 용도 |
|------|----------|------|
| 3D 엔진 | [Three.js](https://threejs.org) r128 | WebGL 렌더링, 씬 관리, GLTF/DRACO 로더 |
| 차트 | [Chart.js](https://www.chartjs.org) 4.x | 대시보드 시각화 |
| 스타일링 | 바닐라 CSS | 글래스모피즘, 다크 모드, 애니메이션 |
| 로직 | ES6+ JavaScript | 모듈형 IIFE 패턴, 이벤트 시스템 |
| 구조 | HTML5 | 시맨틱 마크업, 접근성(aria) |
| 3D 모델 | GLTF + DRACO 압축 | Z-Anatomy (CC BY-SA 4.0) + HuBMAP 장기 모델 |

**빌드 도구 제로** — 어떤 정적 HTTP 서버에서든 즉시 실행됩니다.

---

## 📁 프로젝트 구조

```
edusim/
├── index.html                  # 단일 페이지 진입점
├── favicon.png                 # 파비콘
├── css/
│   └── styles.css              # 디자인 시스템 (700+ 라인)
├── js/
│   ├── app.js                  # 메인 컨트롤러, 라우팅, 백그라운드 애니메이션
│   ├── sceneManager.js         # Three.js 라이프사이클, 프리뷰 렌더러
│   ├── simulations/
│   │   └── anatomy.js          # GLTF 인체 탐색기 (200+ 구조물 + 장기 10개)
│   ├── ui/
│   │   ├── dashboard.js        # Chart.js 대시보드 (4종 차트)
│   │   ├── hud.js              # 시뮬레이션 내 컨텍스트 HUD 패널
│   │   ├── notifications.js    # 토스트 알림 시스템
│   │   └── objectives.js       # 학습 목표 추적기
│   └── utils/
│       ├── analytics.js        # 세션 추적, localStorage 영구화
│       └── helpers.js          # 수학/색상/유틸 함수
├── models/
│   ├── body.glb                # 전체 인체 GLTF 모델
│   └── organs/                 # 개별 장기 모델 (심장, 뇌, 폐, 간, 신장 등)
└── README.md
```

---

## 🚀 빠른 시작

### 1) 저장소 클론

```bash
git clone https://github.com/sigco3111/edusim.git
cd edusim
```

### 2) 정적 서버 실행 (택 1)

```bash
# Python 3
python3 -m http.server 8080

# 또는 Node
npx serve .

# 또는 VS Code Live Server 확장 사용
```

### 3) 브라우저 열기

<http://localhost:8080>

---

## 🗺️ 한국어화 범위

본 저장소는 원본의 식별자(예: `models/organs/heart.glb` 경로, JavaScript 모듈 키)와 Three.js / Chart.js 같은 라이브러리 이름을 그대로 유지하면서 다음 사용자 노출 영역을 모두 한국어로 번역했습니다.

| 영역 | 번역 내용 |
|------|----------|
| `<html lang>` / `<title>` / 메타 디스크립션 | 한글 + `lang="ko"` |
| 네비게이션 / 히어로 / 섹션 헤더 | 시뮬레이션 / 대시보드 / 인체 해부 아틀라스 / 학습자 진도 대시보드 |
| 통계 카드 / 차트 카드 타이틀 | 200+ 해부학적 구조물 / 시간에 따른 학습 진도 / 신체 시스템 탐색률 등 |
| 카드 본문 / 푸터 | 추천 — GLTF 모델 / 인체 해부 아틀라스 본문 / 푸터 카피라이트 |
| 시뮬레이션 툴바 / 튜토리얼 오버레이 | 1단계 / 3단계 / 인체 해부학 탐색기에 오신 것을 환영합니다 |
| HUD 패널 라벨 (4종 시뮬레이션) | 신체 시스템 / 선택된 구조물 / 근육 불투명도 / 정면 / 후면 / 검색 |
| 제어 버튼 (레이어 / 뷰 / 모드) | 근육 / 뼈 / 장기 / 내부 보기 / X-레이 모드 |
| 알림 / 토스트 | 모델 불러오기 완료 / 찾음 / 찾을 수 없음 / 초기화 / 모든 목표 달성 |
| 학습 목표 정의 | 5종(chemistry) + 5종(physics) + 5종(anatomy) 모두 한국어 |
| 장기 메타데이터 | 10개 장기(이름 / 설명 / 위키 링크) 모두 한국어 + 한국어 위키백과 |
| 메시 → 한국어 표기 변환 | `formatAnatomyName()`에 400+ 항목의 `ANATOMY_NAME_KO` 매핑 테이블 |
| 메시 분류 라벨 | 근육 / 뼈 / 장기 / 구조물 |
| 차트 라벨 / 축 단위 | 근육 / 뼈 / 장기 / 정확도 / 속도 / 이해도 / 탐색성 / 유지력 / 분 |
| 요일 / 주차 라벨 | 월~일 / 1주~8주 |
| 콘솔 메시지 / 에러 로그 | 모델 로드 실패 / 장기를 불러올 수 없음 등 |
| 문서 주석 | 모든 JS / CSS / HTML 상단 docstring |

식별자 / 클래스명 / Three.js 객체 / `localStorage` 키 / 함수 이름은 동작 보장을 위해 **그대로 유지**합니다.

---

## 🎯 설계 결정

- **프레임워크 없음** — 바닐라 JS/HTML/CSS로 제작해 핵심 웹 표준을 직접 시연
- **Three.js CDN** — npm/webpack 설정 없이 어떤 정적 서버에서든 즉시 실행
- **GLTF + DRACO** — 실제 해부 모델을 약 35MB로 압축해 빠른 로딩 보장
- **글래스모피즘 + 다크 모드** — 과학/교육 플랫폼에 어울리는 세련되고 현대적인 미감
- **점진적 정보 공개** — 첫 사용자용 튜토리얼 오버레이, 컨텍스트 HUD 패널
- **모듈형 IIFE 패턴** — 각 시뮬레이션이 `init() / update() / reset() / cleanup()` 라이프사이클을 가진 독립 모듈

---

## 🌐 배포

본 저장소는 GitHub Pages로 자동 배포됩니다.

- `main` 브랜치의 루트에서 정적 사이트 제공
- 빌드 단계 없음 — `index.html`을 그대로 호스팅
- 모델 자산(`.glb`)은 같은 경로(`models/`)에서 직접 로딩

---

## 🙏 크레딧 / 라이선스

- **원작**: Deep Gori — [deepgori/edusim](https://github.com/deepgori/edusim) (MIT License)
- **3D 인체 모델**: [Z-Anatomy](https://www.z-anatomy.com/) — CC BY-SA 4.0
- **장기 모델**: HuBMAP CCF 3D Reference Library (Visual Human Male, CC BY 4.0)
- **한글화**: [sigco3111](https://github.com/sigco3111) — 모든 UI/콘텐츠 한국어 번역, README 한글화
- **아이콘 / 이모지**: 시스템 유니코드 이모지

MIT License — 본 저장소는 원본의 자유로운 사용·수정·배포 조건을 그대로 따릅니다.