import React, { useState, useEffect } from "react";
import "./Page.scss";
import Spinner from "../Spinner/Spinner";
import { AppConsumer } from "../../context/App";
import VerseLayout from "./VerseLayout";
import PageHeader from "./PageHeader";
import DDrop from "../DDrop";

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
    let imageName = NumToString(index + 1);

    //using two states to support the page animation
    const [imageLoaded, setImageLoaded] = useState(false);

    const onImageLoaded = e => {
        // console.log(
        //     `**onImageLoaded(${parseInt(index) +
        //         1}) (imageLoaded=${imageLoaded})`
        // );
        setTimeout(() => {
            setImageLoaded(true);
        }, 100); //Make sure imageLoaded is set after index update event handler
    };

    let image;

    //Run after componentDidMount, componentDidUpdate, and props update
    useEffect(() => {
        setImageLoaded(false);
    }, [index]);

    let textAlign =
        app.pagesCount === 1 ? "center" : order === 0 ? "left" : "right";

    const pageWidth = app.pageWidth();
    const imageUrl =
        process.env.PUBLIC_URL + "/qpages_1260/page" + imageName + ".png";

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
            <Spinner visible={!imageLoaded} />
            <div
                onClick={e => {
                    app.setShowMenu(false);
                }}
                className="PageFrame"
                style={{
                    textAlign,
                    visibility: imageLoaded ? "visible" : "hidden"
                }}
            >
                <div
                    className={
                        "PageImageFrame" + (imageLoaded ? " AnimatePage" : "")
                    }
                    style={{
                        transform: `scaleX(${scaleX ||
                            1}) translateX(${shiftX || 0}px)`
                    }}
                >
                    <VerseLayout page={index} pageWidth={pageWidth}>
                        <img
                            ref={ref => {
                                image = ref;
                            }}
                            style={{
                                visibility: imageLoaded ? "visible" : "hidden",
                                margin: app.pageMargin(),
                                width: pageWidth,
                                height: app.pageHeight()
                            }}
                            className={"PageImage"}
                            onLoad={onImageLoaded}
                            src={imageUrl}
                            alt={"Page #" + (parseInt(index) + 1).toString()}
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
