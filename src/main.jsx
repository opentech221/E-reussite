import React, { Suspense, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import '@/index.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/hooks/useCart';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

const GlobalFallback = () => (
  <div className="w-full h-screen flex items-center justify-center">
    <div className="animate-pulse space-y-4 w-80">
      <div className="h-6 bg-slate-200 rounded" />
      <div className="h-6 bg-slate-200 rounded" />
      <div className="h-6 bg-slate-200 rounded" />
    </div>
  </div>
);

// Preload critical routes on idle and hover
function setupRoutePrefetch() {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      import('@/pages/Dashboard');
      import('@/pages/Profile');
      import('@/pages/CoursesPublic');
      import('@/pages/CoursesPrivate');
    });
  } else {
    setTimeout(() => {
      import('@/pages/Dashboard');
      import('@/pages/Profile');
      import('@/pages/CoursesPublic');
      import('@/pages/CoursesPrivate');
    }, 1200);
  }

  const links = [
    { selector: 'a[href="/dashboard"]', loader: () => import('@/pages/Dashboard') },
    { selector: 'a[href="/profile"]', loader: () => import('@/pages/Profile') },
    { selector: 'a[href="/courses"]', loader: () => import('@/pages/CoursesPublic') },
    { selector: 'a[href="/my-courses"]', loader: () => import('@/pages/CoursesPrivate') },
  ];

  links.forEach(({ selector, loader }) => {
    document.addEventListener('mouseover', (e) => {
      const target = e.target;
      if (target && target.closest && target.closest(selector)) {
        loader();
      }
    }, { passive: true });
  });
}

function Root() {
  useEffect(() => {
    setupRoutePrefetch();
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={<GlobalFallback />}>
              <App />
              <Toaster />
            </Suspense>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Root />
);