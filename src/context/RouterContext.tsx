import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface RouteMatch {
  path: string;
  pattern: string;
  params: Record<string, string>;
  query: Record<string, string>;
}

interface RouterContextType {
  currentPath: string;
  params: Record<string, string>;
  query: Record<string, string>;
  navigate: (to: string, options?: { replace?: boolean }) => void;
  goBack: () => void;
  matches: (pattern: string) => boolean;
}

const RouterContext = createContext<RouterContextType | null>(null);

function parsePath(fullUrl: string): { pathname: string; query: Record<string, string> } {
  // Support both standard paths and hash fallback
  let path = fullUrl;
  if (path.includes('#')) {
    const hashPart = path.split('#')[1] || '/';
    path = hashPart.startsWith('/') ? hashPart : '/' + hashPart;
  }
  const [pathname, queryString] = path.split('?');
  const query: Record<string, string> = {};
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    searchParams.forEach((val, key) => {
      query[key] = val;
    });
  }
  return { pathname: pathname || '/', query };
}

function matchPattern(pattern: string, pathname: string): { match: boolean; params: Record<string, string> } {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return { match: false, params: {} };
  }

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const pPart = patternParts[i];
    const aPart = pathParts[i];
    if (pPart.startsWith(':')) {
      const paramName = pPart.slice(1);
      params[paramName] = decodeURIComponent(aPart);
    } else if (pPart !== aPart) {
      return { match: false, params: {} };
    }
  }

  return { match: true, params };
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialPath = () => {
    if (typeof window === 'undefined') return '/';
    // If hash routing is used (e.g. #/home)
    if (window.location.hash) {
      const h = window.location.hash.slice(1);
      return h.startsWith('/') ? h : '/' + h;
    }
    return window.location.pathname || '/';
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);
  const [query, setQuery] = useState<Record<string, string>>({});
  const [params, setParams] = useState<Record<string, string>>({});

  const updateRoute = useCallback((path: string) => {
    const { pathname, query: parsedQuery } = parsePath(path);
    setCurrentPath(pathname);
    setQuery(parsedQuery);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      let path = window.location.pathname;
      if (window.location.hash) {
        const h = window.location.hash.slice(1);
        path = h.startsWith('/') ? h : '/' + h;
      }
      updateRoute(path);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    // Initial sync
    updateRoute(getInitialPath());

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [updateRoute]);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    let cleanTo = to;
    if (!cleanTo.startsWith('/')) cleanTo = '/' + cleanTo;

    try {
      if (options?.replace) {
        window.history.replaceState({}, '', cleanTo);
      } else {
        window.history.pushState({}, '', cleanTo);
      }
    } catch {
      // Fallback for strict sandbox iframe
      window.location.hash = '#' + cleanTo;
    }

    const { pathname, query: parsedQuery } = parsePath(cleanTo);
    setCurrentPath(pathname);
    setQuery(parsedQuery);
    window.scrollTo(0, 0);
  }, []);

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/home');
    }
  }, [navigate]);

  const matches = useCallback(
    (pattern: string): boolean => {
      const { match, params: extractedParams } = matchPattern(pattern, currentPath);
      if (match) {
        setParams(extractedParams);
        return true;
      }
      return false;
    },
    [currentPath]
  );

  return (
    <RouterContext.Provider
      value={{
        currentPath,
        params,
        query,
        navigate,
        goBack,
        matches,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return ctx;
}

// Helper to extract params given a pattern and path
export function matchRoutePattern(pattern: string, pathname: string): { match: boolean; params: Record<string, string> } {
  return matchPattern(pattern, pathname);
}
