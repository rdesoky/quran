import {
    faAngleDown,
    faAngleLeft,
    faAngleRight,
    faAngleUp,
} from "@fortawesome/free-solid-svg-icons";

import Icon from "@/components/Icon";

type HeaderProps = {
    onPageUp: () => void;
    onPageDown: () => void;
    onIncrement: () => void;
    onDecrement: () => void;
};

const Header = ({
    onPageUp,
    onPageDown,
    onIncrement,
    onDecrement,
}: HeaderProps) => {
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

export default Header;
