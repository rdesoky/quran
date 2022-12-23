import React from "react";
import { FormattedMessage as String } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, signOut } from "../../store/dbSlice";
import { selectAppHeight } from "../../store/layoutSlice";
import { ActivityChart } from "../Hifz";
import { UserImage } from "../UserImage";
import Login from "./../Login";

const User = () => {
    const appHeight = useSelector(selectAppHeight);
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
            <div className="PopupBody" style={{ maxHeight: appHeight - 80 }}>
                {user && user.isAnonymous === false ? (
                    <div className="ButtonsBar">
                        <UserImage />
                        <div className="VCentered" style={{ flexGrow: 1 }}>
                            <div>{user.displayName}</div>
                            <div>{user.email}</div>
                        </div>
                        <div className="ButtonsBar">
                            <button onClick={onSignOut}>
                                <String id="sign_out" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div>
                            <String id="guest_msg" />
                        </div>
                        <Login />
                    </div>
                )}
                <hr />
                <ActivityChart activity="pages" />
                <hr />
                <ActivityChart activity="chars" />
            </div>
        </>
    );
};

export default User;
