import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";

const CartaoOverlayReturnFocusContext = createContext(null);

export function CartaoOverlayReturnFocusProvider({ children }) {
  const returnFocusElRef = useRef(null);

  const setReturnFocusElement = useCallback((el) => {
    returnFocusElRef.current = el;
  }, []);

  const consumeReturnFocus = useCallback(() => {
    const el = returnFocusElRef.current;
    returnFocusElRef.current = null;
    return el;
  }, []);

  const value = useMemo(
    () => ({ setReturnFocusElement, consumeReturnFocus }),
    [setReturnFocusElement, consumeReturnFocus]
  );

  return (
    <CartaoOverlayReturnFocusContext.Provider value={value}>
      {children}
    </CartaoOverlayReturnFocusContext.Provider>
  );
}

export function useCartaoOverlayReturnFocus() {
  return useContext(CartaoOverlayReturnFocusContext);
}
