import React, { useState, useEffect } from "react";
import "./Spinner.css";

function Spinner({ visible }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setShow(visible); //Delay showing the spinner to prevent flickering
        }, 300);
    }, [visible]);

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
