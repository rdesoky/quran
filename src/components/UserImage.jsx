import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { downloadImage } from "../services/utils";
import { selectPhotoUrl } from "../store/dbSlice";

export const UserImage = () => {
    const [imageUrl, setImageUrl] = useState(null);
    // const user = useSelector(selectUser);
    const photoURL = useSelector(selectPhotoUrl);

    useEffect(() => {
        if (photoURL) {
            const url = photoURL;
            downloadImage(url)
                .then(() => {
                    setImageUrl(url);
                })
                .catch((e) => {});
        } else {
            setImageUrl(null);
        }
    }, [photoURL]);

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
