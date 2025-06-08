import { FC, useEffect, useState } from "react";

const Transition: FC<{ children: React.ReactNode; feature?: string }> = ({
    children,
    feature = "trans",
}) => {
    const [className, updateStyle] = useState(feature + "-start");

    useEffect(() => {
        setTimeout(() => {
            updateStyle(feature + "-end");
        }, 1);
    }, [feature]);

    return <div className={className}>{children}</div>;
};

export default Transition;
