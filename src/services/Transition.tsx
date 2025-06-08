import { FC, useEffect, useState } from "react";

const Transition: FC<{ children: React.ReactNode; feature?: string }> = ({
    children,
    feature,
}) => {
    const getInitialClass = () => {
        const className = feature || "trans";
        return className;
    };

    const [className, updateStyle] = useState(getInitialClass() + "-start");

    useEffect(() => {
        setTimeout(() => {
            const className = getInitialClass();
            updateStyle(className + "-end");
        }, 1);
    }, []);

    return <div className={className}>{children}</div>;
};

export default Transition;
