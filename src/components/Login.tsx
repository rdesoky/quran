import { analytics } from "@/services/analytics";
import { selectUser } from "@/store/dbSlice";
import firebase, { User as FirebaseUser } from "firebase";
import { ReactNode } from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { useSelector } from "react-redux";

interface LoginProps {
    onClose?: () => void;
}

export default function Login({ onClose }: LoginProps): ReactNode {
    const user: FirebaseUser | null = useSelector(selectUser);

    const handleClose = (): void => {
        analytics.logEvent("user_signed_in");
        if (typeof onClose === "function") {
            onClose();
        }
    };

    const uiConfig: firebaseui.auth.Config = {
        // Popup signin flow rather than redirect flow.
        signInFlow: "popup",
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            firebase.auth.GithubAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
        ],
        autoUpgradeAnonymousUsers: true,
        callbacks: {
            // Avoid redirects after sign-in.
            signInSuccessWithAuthResult: handleClose as any,
            // signInFailure callback must be provided to handle merge conflicts which
            // occur when an existing credential is linked to an anonymous user.
            signInFailure: function (error: any): Promise<void> {
                const anonymousUser = firebase.auth().currentUser;
                // For merge conflicts, the error.code will be
                // 'firebaseui/anonymous-upgrade-merge-conflict'.
                if (
                    error.code !== "firebaseui/anonymous-upgrade-merge-conflict"
                ) {
                    return Promise.resolve();
                }
                // The credential the user tried to sign in with.
                const cred = error.credential;
                // If using Firebase Realtime Database. The anonymous user data has to be
                // copied to the non-anonymous user.
                const fbApp = firebase.app();
                // Save anonymous user data first.
                return fbApp
                    .database()
                    .ref("data/" + anonymousUser?.uid)
                    .once("value")
                    .then((_snapshot: firebase.database.DataSnapshot) => {
                        // data = snapshot.val();
                        // This will trigger onAuthStateChanged listener which
                        // could trigger a redirect to another page.
                        // Ensure the upgrade flow is not interrupted by that callback
                        // and that this is given enough time to complete before
                        // redirection.
                        return firebase.auth().signInWithCredential(cred);
                    })
                    .then((_signInResponse: firebase.auth.UserCredential) => {
                        //TODO: merge data[activity,aya_marks,hifz,page_marks] into the new user data
                        // return fbApp
                        //     .database()
                        //     .ref("data/" + signInResponse.user.uid)
                        //     .set(data);
                        return;
                    })
                    .then(() => {
                        //delete anonymous user data from Firebase to save storage
                        //TODO: test carefully before publishing
                        return fbApp
                            .database()
                            .ref()
                            .child(`data/${anonymousUser?.uid}`)
                            .remove();
                    })
                    .then(() => {
                        // Delete anonymous user.
                        return anonymousUser?.delete();
                    })
                    .then(() => {
                        // Clear data in case a new user signs in, and the state change
                        // triggers.
                        // data = null;
                        // FirebaseUI will reset and the UI cleared when this promise
                        // resolves.
                        // signInSuccessWithAuthResult will not run. Successful sign-in
                        // logic has to be run explicitly.
                        handleClose();
                    });
            },
        },
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
            {typeof onClose === "function" ? (
                <div>
                    <button onClick={handleClose}>Cancel</button>
                </div>
            ) : (
                ""
            )}
        </div>
    );
}
