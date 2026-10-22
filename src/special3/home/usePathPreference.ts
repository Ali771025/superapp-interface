import { useEffect, useState } from 'react';
import { PATH_PREFERENCE_EVENT, PATH_PREFERENCE_STORAGE_KEY, readPathPreference, writePathPreference, type PathPreference } from './pathPreference';

export function usePathPreference() {
  const [selectedPath,setSelectedPath] = useState<PathPreference|null>(() => readPathPreference());
  useEffect(() => {
    const sync = () => setSelectedPath(readPathPreference());
    window.addEventListener(PATH_PREFERENCE_EVENT,sync);
    window.addEventListener('storage',sync);
    return () => { window.removeEventListener(PATH_PREFERENCE_EVENT,sync); window.removeEventListener('storage',sync); };
  },[]);
  const selectPath = (path:PathPreference) => { writePathPreference(path); setSelectedPath(path); };
  return { selectedPath, selectPath } as const;
}

export { PATH_PREFERENCE_STORAGE_KEY };
