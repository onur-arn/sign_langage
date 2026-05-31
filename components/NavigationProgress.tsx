'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    setVisible(true);
    setProgress(0);

    let current = 0;
    timerRef.current = setInterval(() => {
      current += Math.random() * 15;
      if (current >= 90) {
        current = 90;
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setProgress(current);
    }, 100);

    const finish = setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(100);
      setTimeout(() => setVisible(false), 300);
    }, 800);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearTimeout(finish);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] transition-all duration-200 ease-out"
      style={{
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #5ba4b0, #7ec8d3)',
        boxShadow: '0 0 8px rgba(91,164,176,0.6)',
        opacity: progress >= 100 ? 0 : 1,
      }}
    />
  );
}
