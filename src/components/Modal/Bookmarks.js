import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import firebase from "firebase";

const Bookmarks = () => {
    const [images, setImages] = useState("");

    useEffect(() => {
        const publicRef = firebase
            .database()
            .ref()
            .child("public");

        publicRef.on("value", snapshot => {
            const pub = snapshot.val();
            setImages(pub.images);
        });
    });

    return (
        <>
            <div className="Title">
                <FormattedMessage id="bookmarks" />
            </div>
            <div>{images}</div>
        </>
    );
};

export default Bookmarks;
