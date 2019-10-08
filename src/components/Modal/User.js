import React, { useEffect, useState } from "react";
import { AppConsumer } from "../../context/App";
import { FormattedMessage as String } from "react-intl";
import Login from "./../Login";
import firebase from "firebase";

const User = ({ app }) => {
    const { user } = app;

    return (
        <>
            <div className="Title">
                <String id="profile" />
            </div>
            {user && user.isAnonymous === false ? (
                <>
                    <div>
                        <img
                            src={user.photoURL}
                            style={{ width: 50, height: 50 }}
                        />
                    </div>
                    <div>{user.displayName}</div>
                    <div>{user.email}</div>
                    <hr />
                    <div className="FieldAction">
                        <button onClick={e => firebase.auth().signOut()}>
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

export default AppConsumer(User);
