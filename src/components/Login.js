import React, { useEffect, useState } from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { AppConsumer } from "./../context/App";
import firebase from "firebase";

const Login = ({ app, onClose }) => {
    const { user } = app;

    const finishLogin = () => {
        if (typeof onClose === "function") {
            onClose();
        }
    };

    const uiConfig = {
        // Popup signin flow rather than redirect flow.
        signInFlow: "popup",
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            firebase.auth.GithubAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],

        callbacks: {
            // Avoid redirects after sign-in.
            signInSuccessWithAuthResult: finishLogin
        }
    };

    if (user && !user.isAnonymous) {
        return <div>Logged in as {user.email}</div>;
    }

    return (
        <div>
            <div>
                <StyledFirebaseAuth
                    uiConfig={uiConfig}
                    firebaseAuth={firebase.auth()}
                />
            </div>
            {typeof onClose == "function" ? (
                <div>
                    <button onClick={finishLogin}>Cancel</button>
                </div>
            ) : (
                ""
            )}
        </div>
    );
};

export default AppConsumer(Login);
