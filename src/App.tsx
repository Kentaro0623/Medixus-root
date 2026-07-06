import { useEffect, useState } from 'react';
import Landing from './landing/Landing';
import TestDrive from './testdrive/TestDrive';

/** 超軽量ハッシュルーター: `#/test-drive` でデモ、それ以外はLP */
export default function App() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHash = () => {
      setHash(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const isTestDrive = hash.startsWith('#/test-drive');
  return isTestDrive ? <TestDrive /> : <Landing />;
}
