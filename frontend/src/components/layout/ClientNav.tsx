'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

// Routes where the sidebar/nav should NOT appear
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/welcome'];

export default function ClientNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';

  const shouldHide = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isMessages = pathname.startsWith('/messages');

  return (
    <>
      {!shouldHide && <Sidebar />}
      <main className={!shouldHide ? (isMessages ? "md:ml-64 h-screen overflow-hidden bg-[#0b0e14]" : "md:ml-64 min-h-screen") : "min-h-screen"}>
        {children}
      </main>
      {!shouldHide && !isMessages && <BottomNav />}
    </>
  );
}
