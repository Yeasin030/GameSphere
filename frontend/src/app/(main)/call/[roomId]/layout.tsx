import React from 'react';

export function generateStaticParams() {
  return [{ roomId: 'lobby' }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
