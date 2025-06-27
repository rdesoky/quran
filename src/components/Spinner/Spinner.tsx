import React, { useState, useEffect } from "react";
import "@/components/Spinner/Spinner.css";

type SpinnerProps = {
    visible: boolean;
};
function Spinner({ visible }: SpinnerProps) {
    const [timeoutHandle, setTimeoutHandle] = useState<number | null>(null);

    useEffect(() => {
        let unmounted = false;
        const timeoutHandle: number = window.setTimeout(() => {
            //TODO: check if mounted
            if (unmounted) {
                return;
            }
        }, 300);
        setTimeoutHandle(timeoutHandle);
        return () => {
            unmounted = true;
        };
    }, [visible]);

    useEffect(() => {
        return () => {
            if (timeoutHandle) {
                window.clearTimeout(timeoutHandle);
            }
        };
    }, [timeoutHandle]);

    return (
        <div
            className="Spinner"
            style={{ visibility: visible ? "visible" : "hidden" }}
        >
            <div />
            <div />
            <div />
            <div />
        </div>
    );
}

export default Spinner;
