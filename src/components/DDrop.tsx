import { useCallback, useEffect, useRef, useState } from "react";

type DDropProps = {
	children: (props: { dX: number; dY: number }) => React.ReactNode;
	onDrop: (props: { dX: number; dY: number }) => void;
	minShift?: number; // shift before drag is triggered
	dropShift?: number; // shift before drop is triggered
	maxShift?: number; // shift before drop is triggered
};

const DDrop = ({
	children,
	onDrop,
	minShift = 20, //shift before drag is triggered
	dropShift = 50,
}: // maxShift = 200, //shift before drop is triggered
	DDropProps) => {
	const [pointerCaptured, setPointerCaptured] = useState(false);
	const [pointerDown, setPointerDown] = useState(false);
	const [startX, setStartX] = useState(0);
	const [startY, setStartY] = useState(0);
	const [dX, setDX] = useState(0);
	const [dY, setDY] = useState(0);
	const rootRef = useRef<HTMLDivElement>(null);

	const onPointerDown = useCallback((e: React.PointerEvent) => {
		const { target, clientX, clientY } = e;
		// e.pointerId && console.log(`~~onPointerDown ${e.pointerId}`);

		if ((target as HTMLElement).tagName.toLowerCase() === "select") {
			return;
		}
		setPointerDown(true);
		setStartX(clientX);
		setStartY(clientY);
		setDX(0);
		setDY(0);
	}, []);

	const onPointerMove = useCallback(
		(e: React.PointerEvent) => {
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
				setDX(clientX - startX);
				setDY(clientY - startY);
			}
		},
		[pointerDown, startX, startY, pointerCaptured, minShift /*, maxShift*/]
	);

	const checkDrop = useCallback(
		(e: React.PointerEvent) => {
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
		(e: React.TouchEvent) => {
			// console.log(`~~onTouchEnd`);
			checkDrop(e as any);
		},
		[checkDrop]
	);

	const onPointerEnd = useCallback(
		(e: React.PointerEvent) => {
			// console.log(`~~onPointerEnd ${e.pointerId}`);
			checkDrop(e);
		},
		[checkDrop]
	);

	const onTouchStart = useCallback(
		(e: React.TouchEvent) => {
			const { target } = e;
			// console.log(`~~onTouchStart`);
			const { clientX, clientY } = e.targetTouches[0];
			onPointerDown({ clientX, clientY, target } as React.PointerEvent);
			// e.preventDefault();
		},
		[onPointerDown]
	);

	const onTouchMove = useCallback(
		(e: React.TouchEvent) => {
			const { clientX, clientY } = e.targetTouches[0]; //read first finger positions only
			const { currentTarget, pointerId } = e as any;
			// console.log(`~~onTouchMove`);
			onPointerMove({
				clientX,
				clientY,
				currentTarget,
				pointerId,
			} as React.PointerEvent);
			// e.preventDefault();
		},
		[onPointerMove]
	);

	useEffect(() => {
		const rootElement = rootRef.current;
		rootElement?.addEventListener("touchstart", onTouchStart as any, {
			passive: false,
		});
		rootElement?.addEventListener("touchmove", onTouchMove as any, {
			passive: false,
		});
		rootElement?.addEventListener("touchend", onTouchEnd as any, {
			passive: false,
		});
		return () => {
			rootElement?.removeEventListener("touchstart", onTouchStart as any);
			rootElement?.removeEventListener("touchmove", onTouchMove as any);
			rootElement?.removeEventListener("touchend", onTouchEnd as any);
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
