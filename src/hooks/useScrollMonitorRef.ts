import { useCallback, useEffect, useRef, useState } from "react";

export const useScrollMonitorRef = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [enableUp, setEnableUp] = useState(false);
  const [enableDown, setEnableDown] = useState(false);
  const [enableRight, setEnableRight] = useState(false);
  const [enableLeft, setEnableLeft] = useState(false);

  const scrollUp = useCallback((px: number = 100) => {
    if (ref.current) {
      ref.current.scrollBy({ top: -px, behavior: "smooth" });
    }
  }, []);

  const scrollDown = useCallback((px: number = 100) => {
    if (ref.current) {
      ref.current.scrollBy({ top: px, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const measureOverflow = () => {
      if (ref.current) {
        const {
          scrollHeight,
          scrollLeft,
          scrollTop,
          scrollWidth,
          clientHeight,
          clientWidth,
        } = ref.current;
        const overflowY = scrollHeight > clientHeight;
        const overflowX = scrollWidth > clientWidth;
        setEnableUp(overflowY && scrollTop > 0);
        setEnableDown(overflowY && scrollTop + clientHeight < scrollHeight);
        setEnableRight(overflowX && scrollLeft + clientWidth < scrollWidth);
        setEnableLeft(overflowX && scrollLeft > 0);
      }
    };

    measureOverflow(); // Initial check

    // window.addEventListener("scroll", measureOverflow);
    // monitor scroll events on the element itself
    ref.current?.addEventListener("scroll", measureOverflow);
    window.addEventListener("resize", measureOverflow);

    return () => {
      window.removeEventListener("scroll", measureOverflow);
      window.removeEventListener("resize", measureOverflow);
    };
  }, []);

  return {
    ref,
    enableUp,
    enableDown,
    enableRight,
    enableLeft,
    scrollDown,
    scrollUp,
  };
};
