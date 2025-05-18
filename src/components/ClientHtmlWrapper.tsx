'use client';

import { useEffect } from 'react';

export default function ClientHtmlWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add('mdl-js');
  }, []);

  return <>{children}</>;
}
