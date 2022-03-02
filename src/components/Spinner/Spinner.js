import React, { useState, useEffect } from "react";
import "./Spinner.css";
import { setState } from "expect/build/jestMatchersObject";

function Spinner({ visible }) {
    const [show, setShow] = useState(false);
    const [timeoutHandle, setTimeoutHandle] = useState(null);

    useEffect(() => {
        const timeoutHandle = setTimeout(() => {
            //TODO: check if mounted
            setShow(visible); //Delay showing the spinner to prevent flickering
            setTimeoutHandle(null);
        }, 300);
        setState(timeoutHandle);
    }, [visible]);

    useEffect(() => {
        return () => {
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            className="Spinner"
            style={{ visibility: show && visible ? "visible" : "hidden" }}
        >
            <div />
            <div />
            <div />
            <div />
        </div>
    );
}

export default Spinner;
