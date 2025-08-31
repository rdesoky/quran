import { ActivityGrid } from "@/components/ActivityGrid";
import Login from "@/components/Login";
import { UserImage } from "@/components/UserImage";
import useSnapHeightToBottomOf from "@/hooks/useSnapHeightToBottomOff";
import { selectUser, signOut } from "@/store/dbSlice";
import { selectAppHeight, selectIsNarrow } from "@/store/layoutSlice";
import { FormattedMessage as String } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { PlayerButtons } from "../AudioPlayer/PlayerButtons";

const User = () => {
    const appHeight = useSelector(selectAppHeight);
    const bodyRef = useSnapHeightToBottomOf(appHeight - 15);
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const isNarrow = useSelector(selectIsNarrow);

    const onSignOut = () => {
        dispatch(signOut());
    };

    return (
        <>
            <div className="Title">
                <String id="profile" />
                {isNarrow ? <PlayerButtons trigger="tafseer_title" /> : null}
            </div>
            <div className="PopupBody" ref={bodyRef}>
                <div className="HCentered">
                    {user?.isAnonymous === false ? (
                        <>
                            <div className="VACentered">
                                <UserImage />
                            </div>
                            <div className="VCentered" style={{ padding: 10 }}>
                                <div>{user.displayName}</div>
                                <div>{user.email}</div>
                                <button onClick={onSignOut} className="btn">
                                    <String id="sign_out" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <String id="guest_msg" />
                            </div>
                            <Login />
                        </>
                    )}
                </div>
                <div className="VACentered">
                    <div>
                        <hr />
                        <ActivityGrid activity="pages" />
                        <hr />
                        <ActivityGrid activity="chars" />
                    </div>
                </div>
            </div>
        </>
    );
};

export default User;
