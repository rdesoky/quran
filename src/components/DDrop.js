import React, { useState, useEffect, useRef, useCallback } from "react";

const DDrop = ({ children, onDrop, maxShift, minShift, dropShift }) => {
    const [captured, setCaptured] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [dX, setDX] = useState(0);
    const [dY, setDY] = useState(0);
    const rootRef = useRef();
    const onTouchStart = useCallback((e) => {
        const { clientX, clientY } = e.targetTouches[0];
        const { target } = e;
        onMouseDown({ clientX, clientY, target });
        // e.preventDefault();
    }, []);
    const onMouseMove = useCallback(
        (e) => {
            const { clientX, clientY } = e;
            const min = minShift || 10;
            if (captured) {
                const shiftX = Math.abs(clientX - startX);
                const shiftY = Math.abs(clientY - startY);
                if (shiftX > min && shiftX < maxShift) {
                    setDX(clientX - startX);
                }
                if (shiftY > min && shiftY < maxShift) {
                    setDY(clientY - startY);
                }
                e?.stopPropagation?.();
            }
        },
        [captured, maxShift, minShift, startX, startY]
    );
    const onTouchMove = useCallback(
        (e) => {
            const { clientX, clientY } = e.targetTouches[0];
            const { target } = e;
            onMouseMove({ clientX, clientY, target });
            e.preventDefault();
        },
        [onMouseMove]
    );

    const onMouseDown = (e) => {
        const { target, clientX, clientY, pointerId } = e;
        if (target.tagName.toLowerCase() === "select") {
            return;
        }
        if (pointerId) {
            target.setPointerCapture(pointerId);
        }
        setCaptured(true);
        setStartX(clientX);
        setStartY(clientY);
        setDX(0);
        setDY(0);
        e?.stopPropagation?.();
    };

    const onMouseUp = useCallback(
        (e) => {
            const { target, pointerId } = e;
            if (pointerId) {
                target.releasePointerCapture(pointerId);
            }
            if (dropShift <= Math.abs(dX) || dropShift <= Math.abs(dY)) {
                onDrop({ dX, dY });
                setTimeout(() => {
                    setDX(0);
                    setDY(0);
                }, 200);
                e?.preventDefault();
            } else {
                setDX(0);
                setDY(0);
            }
            // e?.stopPropagation();
            setCaptured(false);
        },
        [dX, dY, onDrop]
    );
    useEffect(() => {
        const rootElement = rootRef.current;
        rootElement?.addEventListener("touchstart", onTouchStart, {
            passive: false,
        });
        rootElement?.addEventListener("touchmove", onTouchMove, {
            passive: false,
        });
        rootElement?.addEventListener("touchend", onMouseUp, {
            passive: false,
        });
        return () => {
            rootElement?.removeEventListener("touchstart", onTouchStart);
            rootElement?.removeEventListener("touchmove", onTouchMove);
            rootElement?.removeEventListener("touchend", onMouseUp);
        };
    }, [onMouseUp, onTouchMove, onTouchStart]);

    return (
        <div
            className="DDrop"
            ref={rootRef}
            // onTouchStart={onTouchStart}
            // onTouchMove={onMouseMove}
            // onTouchEnd={onMouseUp}
            onPointerDown={onMouseDown}
            onPointerMove={onMouseMove}
            onPointerUp={onMouseUp}
        >
            {children({ dX, dY })}
        </div>
    );
};

export default DDrop;
