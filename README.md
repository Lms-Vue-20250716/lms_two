# LMS (Learning Management System) 📚

Vue.js 기반의 종합적인 학습 관리 시스템으로, 교육기관에서 강의, 학생, 강사, 출석 등을 통합 관리할 수 있는 웹 애플리케이션입니다.

## 🎯 서비스 개요

**LMS**는 교육기관의 전반적인 교육 운영을 디지털화하여 효율적으로 관리할 수 있는 시스템입니다. 강의 개설부터 수강생 관리, 출석 체크, 성적 관리, 취업 상담까지 교육기관에서 필요한 모든 기능을 포함하고 있습니다.

### 주요 특징

- 📊 **종합 관리**: 강의, 학생, 강사, 시설을 하나의 시스템에서 통합 관리
- 🎓 **교육 중심**: 출석 관리, 시험 정보, 학습 자료 제공
- 💼 **취업 지원**: 이력서 관리, 취업 상담, 채용 정보 관리
- 📈 **데이터 분석**: 통계 및 설문조사를 통한 교육 품질 개선
- 🏢 **시설 관리**: 강의실, 장비 등 교육 인프라 관리

## 🏗️ 기술 스택

### Frontend

- **Vue 3** - Progressive JavaScript Framework
- **Vue Router** - 클라이언트 사이드 라우팅
- **Pinia** - Vue 상태 관리
- **Element Plus** - Vue 3 UI 컴포넌트 라이브러리
- **TailwindCSS** - 유틸리티 기반 CSS 프레임워크

### Development Tools

- **Vite** - 빠른 빌드 도구
- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포맷팅
- **Axios** - HTTP 클라이언트
- **Chart.js** - 데이터 시각화

### Additional Libraries

- **@tanstack/vue-query** - 서버 상태 관리
- **Vue-ChartJS** - Vue용 Chart.js 래퍼

## 📋 주요 기능

### 🎓 학습 관리 (Lecture Management)

- **강의 목록 조회**: 개설된 모든 강의 확인
- **강의 등록/수정**: 새로운 강의 개설 및 기존 강의 정보 수정
- **출석 관리**: 실시간 출석 체크 및 출석률 통계
- **시험 정보**: 시험 일정 및 결과 관리

### 👥 사용자 관리 (Personnel Management)

- **학생 관리**: 수강생 정보, 수강 이력, 성적 관리
- **강사 관리**: 강사 정보, 담당 강의, 강의 이력
- **상담 관리**: 학생 상담 내역 및 진로 지도
- **채용 관리**: 취업 정보 및 채용 공고 관리

### 📚 학습 지원 (Support Services)

- **공지사항**: 전체 공지 및 중요 안내사항
- **Q&A**: 학생-강사 간 질의응답
- **학습자료**: 강의별 학습 자료 업로드/다운로드
- **설문조사**: 강의 만족도 및 개선사항 조사

### 👤 회원 관리 (User Services)

- **통계**: 개인별 학습 통계 및 성과 분석
- **이력서**: 개인 이력서 작성 및 관리

### ⚙️ 운영 관리 (System Management)

- **공통코드**: 시스템 전반에서 사용하는 코드 관리
- **강의실**: 강의실 정보 및 시설 관리
- **장비**: 교육 장비 현황 및 관리
- **업체**: 협력 업체 및 취업 연계 기업 관리

## 🚀 설치 및 실행

### 요구사항

- Node.js (v16 이상)
- npm 또는 yarn

### 설치

```bash
# 프로젝트 클론
git clone [repository-url]
cd vue3_v2.0

# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
# 개발 서버 시작 (http://localhost:5173)
npm run dev
```

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

### 코드 품질 관리

```bash
# ESLint 실행 및 자동 수정
npm run lint

# Prettier 포맷팅
npm run format
```

## 📁 프로젝트 구조

```
src/
├── assets/                 # 정적 자원 (이미지, 로고 등)
├── common/                 # 공통 유틸리티
│   ├── catchError.ts      # 에러 처리
│   └── common_time.js     # 시간 관련 유틸리티
├── components/            # Vue 컴포넌트
│   ├── Layout/           # 레이아웃 컴포넌트
│   ├── Lecture/          # 강의 관련 컴포넌트
│   ├── Manage/           # 관리 관련 컴포넌트
│   ├── Support/          # 지원 서비스 컴포넌트
│   ├── User/             # 사용자 관련 컴포넌트
│   ├── system/           # 시스템 관리 컴포넌트
│   └── common/           # 공통 컴포넌트
├── router/               # 라우터 설정
├── stores/               # Pinia 스토어
│   ├── lectureStore.js   # 강의 상태 관리
│   ├── loginInfoState.js # 로그인 정보 관리
│   └── modalState.js     # 모달 상태 관리
├── views/                # 페이지 컴포넌트
└── main.js              # 애플리케이션 진입점
```

## 🔐 인증 및 권한

- **세션 기반 인증**: SessionStorage를 활용한 사용자 정보 관리
- **역할 기반 접근 제어**: 학생(S), 강사(T), 관리자 등 역할별 권한 관리
- **자동 로그인**: 세션 정보를 통한 자동 로그인 기능

## 🛠️ 개발 가이드

### 컴포넌트 구조

각 기능별로 Main, Modal, Search 컴포넌트로 구성:

- **Main**: 목록 표시 및 기본 기능
- **Modal**: 상세 정보 표시 및 등록/수정
- **Search**: 검색 및 필터링 기능

### 상태 관리

- **Pinia**: Vue 3 권장 상태 관리 라이브러리 사용
- **모듈별 스토어**: 기능별로 스토어 분리 관리

### API 통신

- **Axios**: HTTP 클라이언트 라이브러리 사용
- **쿠키 인증**: `withCredentials: true` 설정으로 세션 관리
