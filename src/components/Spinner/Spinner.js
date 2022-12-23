import React, { useState, useEffect } from "react";
import "./Spinner.css";

function Spinner({ visible }) {
    const [timeoutHandle, setTimeoutHandle] = useState(null);

    useEffect(() => {
        let unmounted = false;
        const timeoutHandle = setTimeout(() => {
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
                clearTimeout(timeoutHandle);
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
