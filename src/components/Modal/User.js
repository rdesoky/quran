import React, { useEffect, useState, useContext } from "react";
import { AppConsumer, AppContext } from "../../context/App";
import { FormattedMessage as String } from "react-intl";
import Login from "./../Login";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import Utils from "./../../services/utils";

const User = ({ app }) => {
    const { user } = app;

    const signOut = () => {
        app.signOut();
    };

    return (
        <>
            <div className="Title">
                <String id="profile" />
            </div>
            {user && user.isAnonymous === false ? (
                <>
                    <UserImage />
                    <div>{user.displayName}</div>
                    <div>{user.email}</div>
                    <hr />
                    <div className="FieldAction">
                        <button onClick={signOut}>
                            <String id="sign_out" />
                        </button>
                    </div>
                </>
            ) : (
                <Login />
            )}
        </>
    );
};

export const UserImage = () => {
    const app = useContext(AppContext);
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        if (app.user) {
            const url = app.user.photoURL;
            Utils.downloadImage(url).then(() => {
                setImageUrl(url);
            });
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

export default AppConsumer(User);
