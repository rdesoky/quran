import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import firebase from "firebase";
import { AppConsumer } from "../../context/App";

const Bookmarks = ({ app }) => {
    const [bookmarks, setBoomarks] = useState([]);
    const { user } = app;

    useEffect(() => {
        if (!user) {
            return;
        }

        const publicRef = firebase
            .database()
            .ref()
            .child(`data/${user.uid}/page_marks`);

        const onPageMarksUpdate = publicRef.on("value", snapshot => {
            const pageMarks = snapshot.val();
            const pageList = Object.entries(pageMarks)
                .sort((p1, p2) => (p1[1] < p2[1] ? -1 : 1))
                .map(p => parseInt(p[0]));
            setBoomarks(pageList);
        });

        return () => {
            publicRef.off("value", onPageMarksUpdate);
        };
    }, []); //Passing [] is equivellant to componentDidMount, componentDidUnmount

    const gotoPage = ({ target }) => {
        const pageIndex = parseInt(target.getAttribute("page"));
        app.gotoPage(pageIndex + 1);
    };

    const renderBookmarks = () => {
        return (
            <div
                style={{
                    columnCount: Math.floor((app.popupWidth() - 50) / 120) //-50px margin
                }}
            >
                {bookmarks.map(p => (
                    <button
                        page={p}
                        onClick={gotoPage}
                        style={{
                            width: "100%",
                            textAlign: "inherit",
                            padding: 10
                        }}
                    >
                        <FormattedMessage id="page">
                            {str => str + ": " + (p + 1)}
                        </FormattedMessage>
                    </button>
                ))}
            </div>
        );
    };

    const renderLogin = () => {
        return (
            <div>
                <button onClick={e => app.setPopup("Profile")}>
                    Please Login
                </button>
            </div>
        );
    };

    return (
        <>
            <div className="Title">
                <FormattedMessage id="bookmarks" />
            </div>
            {user ? renderBookmarks() : renderLogin()}
        </>
    );
};

export default AppConsumer(Bookmarks);
