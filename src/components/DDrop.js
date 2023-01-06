import React, { useState, useEffect, useRef, useCallback } from "react";

const DDrop = ({
    children,
    onDrop,
    minShift = 10, //shift before drop is triggered
    dropShift = 50,
    maxShift = 200, //shift before drop is triggered
}) => {
    const [pointerCaptured, setPointerCaptured] = useState(false);
    const [pointerDown, setPointerDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [dX, setDX] = useState(0);
    const [dY, setDY] = useState(0);
    const rootRef = useRef();

    const onPointerDown = useCallback((e) => {
        const { target, clientX, clientY } = e;
        // e.pointerId && console.log(`~~onPointerDown ${e.pointerId}`);

        if (target.tagName.toLowerCase() === "select") {
            return;
        }
        setPointerDown(true);
        setStartX(clientX);
        setStartY(clientY);
        setDX(0);
        setDY(0);
    }, []);

    const onPointerMove = useCallback(
        (e) => {
            if (!pointerDown) {
                return;
            }
            const { clientX, clientY, pointerId, currentTarget } = e;
            const shiftX = Math.abs(clientX - startX);
            const shiftY = Math.abs(clientY - startY);
            let isCaptured = pointerCaptured;
            if (!pointerCaptured && (shiftX > minShift || shiftY > minShift)) {
                if (pointerId) {
                    // console.log(`~~setPointerCapture ${pointerId}`);
                    currentTarget.setPointerCapture(pointerId);
                }
                setPointerCaptured(true);
                isCaptured = true;
                setStartX(clientX);
                setStartY(clientY);
            } else if (isCaptured) {
                // pointerId && console.log(`~~onPointerMove ${pointerId}`);
                if (shiftX > minShift && shiftX < maxShift) {
                    setDX(clientX - startX);
                }
                if (shiftY > minShift && shiftY < maxShift) {
                    setDY(clientY - startY);
                }
            }
        },
        [pointerDown, startX, startY, pointerCaptured, minShift, maxShift]
    );

    const checkDrop = useCallback(
        (e) => {
            const { pointerId, currentTarget } = e;
            setPointerDown(false);
            setPointerCaptured(false);
            if (pointerCaptured) {
                if (pointerId) {
                    currentTarget.releasePointerCapture(pointerId);
                    // console.log(`~~releasePointerCapture ${pointerId}`);
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
            }
        },
        [pointerCaptured, dX, dY, dropShift, onDrop]
    );

    const onTouchEnd = useCallback(
        (e) => {
            // console.log(`~~onTouchEnd`);
            checkDrop(e);
        },
        [checkDrop]
    );

    const onPointerEnd = useCallback(
        (e) => {
            // console.log(`~~onPointerEnd ${e.pointerId}`);
            checkDrop(e);
        },
        [checkDrop]
    );

    const onTouchStart = useCallback(
        (e) => {
            const { target } = e;
            // console.log(`~~onTouchStart`);
            const { clientX, clientY } = e.targetTouches[0];
            onPointerDown({ clientX, clientY, target });
            // e.preventDefault();
        },
        [onPointerDown]
    );

    const onTouchMove = useCallback(
        (e) => {
            const { clientX, clientY } = e.targetTouches[0]; //read first finger positions only
            const { currentTarget, pointerId } = e;
            // console.log(`~~onTouchMove`);
            onPointerMove({ clientX, clientY, currentTarget, pointerId });
            // e.preventDefault();
        },
        [onPointerMove]
    );

    useEffect(() => {
        const rootElement = rootRef.current;
        rootElement?.addEventListener("touchstart", onTouchStart, {
            passive: false,
        });
        rootElement?.addEventListener("touchmove", onTouchMove, {
            passive: false,
        });
        rootElement?.addEventListener("touchend", onTouchEnd, {
            passive: false,
        });
        return () => {
            rootElement?.removeEventListener("touchstart", onTouchStart);
            rootElement?.removeEventListener("touchmove", onTouchMove);
            rootElement?.removeEventListener("touchend", onTouchEnd);
        };
    }, [onTouchEnd, onTouchMove, onTouchStart]);

    return (
        <div
            className="DDrop"
            ref={rootRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
        >
            {children({ dX, dY })}
        </div>
    );
};

export default DDrop;
