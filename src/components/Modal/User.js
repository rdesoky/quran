import React, { useEffect, useState } from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { AppConsumer } from "../../context/App";
import firebase from "firebase";
import { FormattedMessage } from "react-intl";

const User = ({ app }) => {
	const { user } = app;

	// Configure FirebaseUI.
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
			signInSuccessWithAuthResult: () => false
		}
	};
	return (
		<>
			<div className="Title">
				<FormattedMessage id="profile" />
			</div>
			{user && user.isAnonymous === false ? (
				<>
					<div>
						<img src={user.photoURL} style={{ width: 50, height: 50 }} />
					</div>
					<div>{user.displayName}</div>
					<div>{user.email}</div>
					<hr />
					<div className="FieldAction">
						<button onClick={e => firebase.auth().signOut()}>Logout</button>
					</div>
				</>
			) : (
				<StyledFirebaseAuth
					uiConfig={uiConfig}
					firebaseAuth={firebase.auth()}
				/>
			)}
		</>
	);
};

export default AppConsumer(User);
