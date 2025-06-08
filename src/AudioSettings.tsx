import { FormattedMessage as Message } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import ReactSwitch from "react-switch";
import { analytics } from "./services/analytics";
import {
    selectFollowPlayer,
    selectRepeat,
    setFollowPlayer,
    setRepeat,
} from "./store/settingsSlice";
import { selectPopup } from "./store/uiSlice";

export default function AudioSettings() {
    const followPlayer = useSelector(selectFollowPlayer);
    const repeat = useSelector(selectRepeat);
    const dispatch = useDispatch();
    const popup = useSelector(selectPopup);

    const updateFollowPlayer = (checked: boolean) => {
        dispatch(setFollowPlayer(checked));
        localStorage.setItem("followPlayer", String(checked));
        analytics.logEvent(
            checked ? "set_follow_player" : "set_unfollow_player",
            {
                trigger: popup,
            }
        );
    };
    const updateRepeat = (checked: boolean) => {
        dispatch(setRepeat(checked));
        localStorage.setItem("repeat", String(checked));
        analytics.logEvent(checked ? "set_repeat_on" : "set_repeat_off", {
            trigger: popup,
        });
    };
    return (
        <>
            <div className="OptionRow">
                <label>
                    <span>
                        <Message id="repeat" />
                    </span>
                    <ReactSwitch
                        height={22}
                        width={42}
                        onChange={updateRepeat}
                        checked={repeat}
                    />
                </label>
            </div>
            <div className="OptionRow">
                <label>
                    <span>
                        <Message id="followPlayer" />
                    </span>
                    <ReactSwitch
                        height={22}
                        width={42}
                        onChange={updateFollowPlayer}
                        checked={followPlayer}
                        // disabled={player.repeat == 1}
                    />
                </label>
            </div>
        </>
    );
}
