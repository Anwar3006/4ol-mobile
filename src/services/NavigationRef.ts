// navigation/NavigationRef.ts
import {NavigationContainerRef} from '@react-navigation/native';
import {createRef} from 'react';

export const navigationRef = createRef<NavigationContainerRef<any>>();

export function navigate(name: string, params?: object) {
  console.log('Attempting to navigate to:', name, 'with params:', params);

  if (!navigationRef.current) {
    console.error('Navigation ref is null');
    return;
  }

  if (!navigationRef.current.isReady()) {
    console.error('Navigation container is not ready');
    return;
  }

  try {
    navigationRef.current.navigate(name, params);
    console.log('Navigation successful');
  } catch (error) {
    console.error('Navigation failed:', error);
  }
}

export function getCurrentState() {
  if (!navigationRef.current) return null;
  return navigationRef.current.getRootState();
}
