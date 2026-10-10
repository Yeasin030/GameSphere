import React from 'react';

export function generateStaticParams() {
  return [{ slug: 'popular' }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
