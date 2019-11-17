import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../../context/App";
import { FormattedMessage as String } from "react-intl";
import Login from "./../Login";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import Utils from "./../../services/utils";
import { ActivityChart } from "../Hifz";

const User = () => {
    const app = useContext(AppContext);
    const { user } = app;

    const signOut = () => {
        app.signOut();
    };

    return (
        <>
            <div className="Title">
                <String id="profile" />
            </div>
            <div
                className="PopupBody"
                style={{ maxHeight: app.appHeight - 80 }}
            >
                {user && user.isAnonymous === false ? (
                    <div className="ButtonsBar">
                        <UserImage />
                        <div className="VCentered" style={{ flexGrow: 1 }}>
                            <div>{user.displayName}</div>
                            <div>{user.email}</div>
                        </div>
                        <div className="ButtonsBar">
                            <button onClick={signOut}>
                                <String id="sign_out" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <Login />
                )}
                <hr />
                <ActivityChart activity="chars" />
                <hr />
                <ActivityChart activity="pages" />
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
            Utils.downloadImage(url)
                .then(() => {
                    setImageUrl(url);
                })
                .catch(e => {});
        } else {
            setImageUrl(null);
        }
    }, [app.user]);

    return imageUrl ? (
        <img className="UserImage" src={imageUrl} />
    ) : (
        <div className="UserIcon">
            <Icon icon={faUserCircle} />
        </div>
    );
};

export default User;
