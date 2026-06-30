import { useRouterState } from '@tanstack/react-router';
import { useRef } from 'react';

export function useNavigationDirection(): 'forward' | 'back' {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const depth = pathname.split('/').filter(Boolean).length;
  const prevDepthRef = useRef(depth);
  const direction: 'forward' | 'back' = depth >= prevDepthRef.current ? 'forward' : 'back';
  prevDepthRef.current = depth;
  return direction;
}
