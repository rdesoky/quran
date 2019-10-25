import React, { useState } from "react";

const DDrop = ({ children, onDrop, maxShift }) => {
    const [captured, setCaptured] = useState(false);
    const [X, setX] = useState(0);
    const [Y, setY] = useState(0);
    const [dX, setDX] = useState(0);
    const [dY, setDY] = useState(0);

    const onTouchStart = e => {
        onMouseDown(e);
        e.preventDefault();
    };
    const onMouseDown = ({ target, clientX, clientY, pointerId }) => {
        if (pointerId) {
            target.setPointerCapture(pointerId);
        }
        setCaptured(true);
        setX(clientX);
        setY(clientY);
        setDX(0);
        setDY(0);
    };
    const onMouseMove = ({ clientX, clientY }) => {
        if (captured) {
            if (Math.abs(clientX - X) < maxShift) {
                setDX(clientX - X);
            }
            if (Math.abs(clientY - Y) < maxShift) {
                setDY(clientY - Y);
            }
        }
    };
    const onMouseUp = ({ target, pointerId }) => {
        if (pointerId) {
            target.releasePointerCapture(pointerId);
        }
        setCaptured(false);
        onDrop({ dX, dY });
        setDX(0);
        setDY(0);
    };
    return (
        <div
            onTouchStart={onTouchStart}
            onTouchMove={onMouseMove}
            onTouchEnd={onMouseUp}
            onPointerDown={onMouseDown}
            onPointerMove={onMouseMove}
            onPointerUp={onMouseUp}
        >
            {children({ dX, dY })}
        </div>
    );
};

export default DDrop;
