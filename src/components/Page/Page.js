import React, { useState, useEffect } from "react";
import "./Page.scss";
import Spinner from "../Spinner/Spinner";
import { AppConsumer } from "../../context/App";
import VerseLayout from "./VerseLayout";
import PageHeader from "./PageHeader";
import DDrop from "../DDrop";
import Utils from "../../services/utils";

const Page = ({
    index,
    order,
    app,
    onIncrement,
    onDecrement,
    onPageUp,
    onPageDown,
    scaleX,
    shiftX
}) => {
    const [imageUrl, setImageUrl] = useState(null);

    const onImageLoaded = url => {
        setTimeout(() => {
            setImageUrl(url);
        }, 100); //Make sure imageLoaded is set after index update event handler
    };

    let textAlign =
        app.pagesCount === 1 ? "center" : order === 0 ? "left" : "right";

    const pageWidth = app.pageWidth();

    //Run after componentDidMount, componentDidUpdate, and props update
    useEffect(() => {
        setImageUrl(null);
        Utils.downloadPageImage(index).then(onImageLoaded);
    }, [index]);

    return (
        <div className="Page">
            <PageHeader
                index={index}
                order={order}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                onPageUp={onPageUp}
                onPageDown={onPageDown}
            />
            <Spinner visible={imageUrl === null} />
            <div
                onClick={e => {
                    app.setShowMenu(false);
                }}
                className="PageFrame"
                style={{
                    textAlign,
                    visibility: imageUrl ? "visible" : "hidden"
                }}
            >
                <div
                    className={
                        "PageImageFrame" + (imageUrl ? " AnimatePage" : "")
                    }
                    style={{
                        transform: `scaleX(${scaleX ||
                            1}) translateX(${shiftX || 0}px)`
                    }}
                >
                    <VerseLayout page={index} pageWidth={pageWidth}>
                        <img
                            style={{
                                visibility: imageUrl ? "visible" : "hidden",
                                margin: app.pageMargin(),
                                width: pageWidth,
                                height: app.pageHeight()
                            }}
                            src={imageUrl}
                            className="PageImage"
                        />
                    </VerseLayout>
                </div>
            </div>
        </div>
    );
};

function NumToString(number, padding = 3) {
    let padded = number.toString();
    while (padded.length < padding) {
        padded = "0" + padded;
    }
    return padded;
}

export default AppConsumer(Page);
