# VaultArena

허가된 로컬 보안 경기를 위한 데모 웹 애플리케이션입니다.
본 프로젝트는 Firestore Security Rules를 통한 데이터 접근 제어 및 로컬 환경에서의 보안 테스트 과정을 모니터링하기 위해 구축되었습니다.

## 기술 스택
- React, TypeScript, Vite
- Firebase Auth & Cloud Firestore (Emulator Suite 연동)
- Node.js 로컬 경기 제어 서버

## 실행 방법

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **환경변수 설정**
   `.env` 파일을 생성하고 다음 값을 추가하여 에뮬레이터를 활성화하세요:
   ```env
   VITE_USE_EMULATORS=true
   ```

3. **서비스 실행 (총 3개의 터미널 필요)**
   - **터미널 1 (에뮬레이터)**: `npm run emulators`
   - **터미널 2 (대시보드 서버)**: `npm run dashboard` (127.0.0.1:4174 에서 실행)
   - **터미널 3 (웹 클라이언트)**: `npm run dev`

4. **경기 및 판정 테스트 진행**
   - 테스트용 시드 생성: `npm run seed:arena`
   - 자동 공개 판정 봇 실행: `npm run judge:public`
   - 대시보드 클라이언트 `/arena` 경로에서 로그 스트림 확인

## 보호 목표
- 로그인한 사용자는 `vaults/{uid}/items/main` 경로에 있는 자신의 문서만 읽고 수정할 수 있습니다.
- UI 레벨이 아닌, Firestore의 서버 측 `firestore.rules`를 통해 공격자의 다른 경로 접근이 완벽히 차단됩니다.
