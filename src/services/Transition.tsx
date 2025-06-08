import React, { useEffect, useState } from "react";

const Transition = props => {
    const getInitialClass = () => {
        const className = props.feature || "trans";
        return className;
    };

    const [className, updateStyle] = useState(getInitialClass() + "-start");

    useEffect(() => {
        setTimeout(function() {
            const className = getInitialClass();
            updateStyle(className + "-end");
        }, 1);
    });

    return <div className={className}>{props.children}</div>;
};

export default Transition;
