'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SideBar from '@templates/SideBar/SideBar';
import MainContent from '@templates/MainContent/MainContent';

export default function Home() {
  const mainContentRef = useRef<Record<string, HTMLElement>>({});
  const router = useRouter();

  /**
   * @param e - Keyboard event
   */
  const hndleNavigateToLoginWhenCtrlShiftLIsPressed = (e: KeyboardEvent): void => {
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
      e.preventDefault();
      router.push('/login');
    }
  };

  useEffect(() => {
    window.addEventListener(
      'keydown',
      hndleNavigateToLoginWhenCtrlShiftLIsPressed
    );
    return () => {
      window.removeEventListener(
        'keydown',
        hndleNavigateToLoginWhenCtrlShiftLIsPressed
      );
    }
    // we only want to run this effect once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container max-w-7xl px-2 md:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-5 pb-20 md:pb-0">
        <SideBar />
        <div className="pt-8 lg:w-[60%] lg:py-24">
          <MainContent mainContentRef={mainContentRef} />
        </div>
      </div>
    </div>
  );
}
