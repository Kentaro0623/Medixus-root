import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import TestDrive from './testdrive/TestDrive';

// コーポレートサイト同梱ビルド用エントリ: LPを介さずデモを直接マウントする
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TestDrive />
  </StrictMode>,
);
