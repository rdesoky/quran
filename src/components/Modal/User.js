import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { FormattedMessage as String } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { downloadImage } from "../../services/utils";
import { selectUser, signOut } from "../../store/dbSlice";
import { selectAppHeight } from "../../store/layoutSlice";
import { ActivityChart } from "../Hifz";
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

export const UserImage = () => {
    const [imageUrl, setImageUrl] = useState(null);
    const user = useSelector(selectUser);

    useEffect(() => {
        if (user) {
            const url = user.photoURL;
            downloadImage(url)
                .then(() => {
                    setImageUrl(url);
                })
                .catch((e) => {});
        } else {
            setImageUrl(null);
        }
    }, [user, user?.photoURL]);

    return imageUrl ? (
        <span>
            <img className="UserImage" src={imageUrl} alt="User" />
        </span>
    ) : (
        <span className="UserIcon">
            <Icon icon={faUserCircle} />
        </span>
    );
};

export default User;
