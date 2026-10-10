import React from 'react';

export function generateStaticParams() {
  return [{ slug: 'latest' }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
