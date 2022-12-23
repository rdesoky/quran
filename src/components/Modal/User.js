import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../../context/App";
import { FormattedMessage as String } from "react-intl";
import Login from "./../Login";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { downloadImage } from "../../services/utils";
import { ActivityChart } from "../Hifz";
import { useDispatch, useSelector } from "react-redux";
import { selectAppHeight } from "../../store/layoutSlice";
import { selectUser, signOut } from "../../store/dbSlice";

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
    const app = useContext(AppContext);
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        if (app.user) {
            const url = app.user.photoURL;
            downloadImage(url)
                .then(() => {
                    setImageUrl(url);
                })
                .catch((e) => {});
        } else {
            setImageUrl(null);
        }
    }, [app.user]);

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
