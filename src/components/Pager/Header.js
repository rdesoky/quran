import React, { useEffect } from "react";
import { AppConsumer } from "../../context/App";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
    faAngleRight,
    faAngleLeft,
    faAngleDown,
    faAngleUp
} from "@fortawesome/free-solid-svg-icons";

const Header = ({ app, onPageUp, onPageDown, onIncrement, onDecrement }) => {
    return (
        <div className="HeaderNavbar">
            <button className="NavButton NavPgUp" onClick={onPageUp}>
                <Icon icon={faAngleRight} />
            </button>
            <button className="NavButton NavPgDown" onClick={onPageDown}>
                <Icon icon={faAngleLeft} />
            </button>
            <button onClick={onIncrement} className="NavButton NavForward">
                <Icon icon={faAngleDown} />
            </button>
            <button className="NavButton NavBackward" onClick={onDecrement}>
                <Icon icon={faAngleUp} />
            </button>
        </div>
    );
};

export default AppConsumer(Header);
