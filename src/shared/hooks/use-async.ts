"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/** 화면에서 데이터를 불러올 때 쓰는 공통 훅: 로딩·오류·다시 불러오기를 한 번에. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const seq = useRef(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);

  const load = useCallback(async () => {
    const id = ++seq.current;
    setLoading(true);
    try {
      const v = await run();
      if (id === seq.current) { setData(v); setError(null); }
    } catch (e) {
      if (id === seq.current) setError((e as Error).message);
    } finally {
      if (id === seq.current) setLoading(false);
    }
  }, [run]);

  useEffect(() => { void load(); }, [load]);
  return { data, error, loading, reload: load, setData };
}
