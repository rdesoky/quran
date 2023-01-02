import React from "react";
import { FormattedMessage as String } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import useSnapHeightToBottomOf from "../../hooks/useSnapHeightToBottomOff";
import { selectUser, signOut } from "../../store/dbSlice";
import { selectAppHeight } from "../../store/layoutSlice";
import { ActivityChart } from "../Hifz";
import { UserImage } from "../UserImage";
import Login from "./../Login";

const User = () => {
    const appHeight = useSelector(selectAppHeight);
    const bodyRef = useSnapHeightToBottomOf(appHeight - 15);
    const dispatch = useDispatch();
    const user = useSelector(selectUser);

    const onSignOut = () => {
        dispatch(signOut());
    };

    return (
        <>
            <div className="Title">
                <String id="profile" />
            </div>
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
            <hr />
            <div className="PopupBody" ref={bodyRef}>
                <ActivityChart activity="pages" />
                <hr />
                <ActivityChart activity="chars" />
            </div>
        </>
    );
};

export default User;
