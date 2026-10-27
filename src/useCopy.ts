import { useCallback, useEffect, useRef, useState } from 'react';

// Copia texto e lembra qual botão copiou, por 1,6 s ("copiado ✓").
export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback((id: string, text: string) => {
    const done = () => {
      setCopied(id);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(null), 1600);
    };
    const fallback = () => {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
      } catch {
        // sem como copiar: só não marca
      }
      area.remove();
      done();
    };
    if (navigator.clipboard && window.isSecureContext)
      navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }, []);

  return { copied, copy };
}

export function useStored<T extends string>(key: string, fallback: T, valid: readonly T[]) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key) as T | null;
      return stored && valid.includes(stored) ? stored : fallback;
    } catch {
      return fallback;
    }
  });
  const set = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, next);
      } catch {
        // sem localStorage: vale só para esta visita
      }
    },
    [key]
  );
  return [value, set] as const;
}
