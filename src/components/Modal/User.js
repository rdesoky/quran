import React from "react";
import { FormattedMessage as String } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import useSnapHeightToBottomOf from "../../hooks/useSnapHeightToBottomOff";
import { selectUser, signOut } from "../../store/dbSlice";
import { selectAppHeight } from "../../store/layoutSlice";
import { ActivityGrid } from "../ActivityGrid";
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
