import { useState, useEffect, useCallback } from "react";

export function useApi(apiFn, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true); setError(null);
    try {
      const res = await apiFn(...args);
      setData(res.data);
      return res.data;
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      throw e;
    } finally { setLoading(false); }
  }, deps);

  useEffect(() => { execute(); }, []);

  return { data, loading, error, refetch: execute };
}

export async function callApi(apiFn, ...args) {
  const res = await apiFn(...args);
  return res.data;
}