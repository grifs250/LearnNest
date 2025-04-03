'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const debugRoutes = [
  { path: '/debug', label: 'Debug Home' },
  { path: '/debug/jwt', label: 'JWT Debugger' },
  { path: '/debug/db', label: 'Database' },
  { path: '/debug/redirect', label: 'Redirect Check' }
];

export default function DebugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Only render in development or with special flags
  const showDebugTools = process.env.NODE_ENV === 'development' || 
                         process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true';
  
  if (!showDebugTools) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="p-8 bg-base-100 shadow-lg rounded-lg max-w-md text-center">
          <h1 className="text-xl font-bold mb-4">Debug Tools Disabled</h1>
          <p className="mb-4">Debug tools are only available in development environment.</p>
          <Link href="/" className="btn btn-primary">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Debug Tools</h1>
            <div className="flex gap-2">
              <Link href="/" className="btn btn-ghost btn-sm">
                ← Home
              </Link>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="badge badge-primary">Development Mode</div>
              )}
            </div>
          </div>
          
          <div className="tabs tabs-boxed">
            {debugRoutes.map(route => (
              <Link 
                key={route.path} 
                href={route.path}
                className={`tab ${pathname === route.path ? 'tab-active' : ''}`}
              >
                {route.label}
              </Link>
            ))}
          </div>
        </header>
        
        <main className="bg-base-100 rounded-lg shadow-lg p-6">
          {children}
        </main>
        
        <footer className="mt-8 text-center text-sm text-base-content/60">
          <p>These debug tools are only meant for development and troubleshooting.</p>
        </footer>
      </div>
    </div>
  );
} 