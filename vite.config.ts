import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  server: {
    port: 5173, // Vite 개발 서버 포트 (기본값 5173)
    hmr: true, // 핫 모듈 리로드 (HMR) 활성화
    origin: 'http://localhost:5173',
  },
  build: {
    outDir: 'dist', // 빌드된 파일이 저장될 디렉토리
  },
});
