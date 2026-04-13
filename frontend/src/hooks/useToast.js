import { useCallback, useMemo, useState } from "react";

let nextId = 1;

export default function useToast() {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const pushToast = useCallback((message, tone = "info", timeoutMs = 3000) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, tone }]);
    if (timeoutMs > 0) {
      setTimeout(() => removeToast(id), timeoutMs);
    }
    return id;
  }, [removeToast]);

  return useMemo(
    () => ({ toasts, pushToast, removeToast, clearToasts: () => setToasts([]) }),
    [toasts, pushToast, removeToast]
  );
}
