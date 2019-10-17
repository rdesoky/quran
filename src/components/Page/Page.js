import React, { useState, useEffect } from "react";
import "./Page.scss";
import Spinner from "../Spinner/Spinner";
import { AppConsumer } from "../../context/App";
import VerseLayout from "./VerseLayout";
import PageHeader from "./PageHeader";

const Page = ({
    index,
    order,
    app,
    onIncrement,
    onDecrement,
    onPageUp,
    onPageDown
}) => {
    let imageName = NumToString(index + 1);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showProgress, setShowProgress] = useState(true);

    const updateProgress = showProgress => {
        setShowProgress(showProgress);
        // console.log(`updateProgress(${showProgress})`);
    };

    const updateLoaded = isLoaded => {
        // console.log(`updateLoaded(${isLoaded})`);
        setIsLoaded(isLoaded);
        updateProgress(!isLoaded);
    };

    const onImageLoaded = e => {
        // console.log(
        // 	`**onImageLoaded(${parseInt(index) + 1}) (isLoaded=${isLoaded})`
        // );
        setTimeout(() => {
            updateLoaded(true); //To help animation timing
        }, 100);
    };

    //Run after componentDidMount, componentDidUpdate, and props update
    useEffect(() => {
        // console.log(
        // 	`Page number changed to ${parseInt(index) + 1} (isLoaded=${isLoaded})`
        // );
        updateLoaded(false);
    }, [index]); //only run when number changes

    let textAlign =
        app.pagesCount === 1 ? "center" : order === 0 ? "left" : "right";

    return (
        <div className="Page">
            {/* <PageFooter index={index} order={order} /> */}
            <PageHeader
                index={index}
                order={order}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                onPageUp={onPageUp}
                onPageDown={onPageDown}
            />
            <Spinner visible={showProgress} />
            <div
                onClick={e => {
                    app.setShowMenu(false);
                }}
                className="PageFrame"
                style={{
                    // padding: app.isNarrow ? "0" : "0 20px",
                    textAlign,
                    visibility: isLoaded ? "visible" : "hidden"
                }}
            >
                <div
                    className={
                        "PageImageFrame" + (isLoaded ? " AnimatePage" : "")
                    }
                >
                    <VerseLayout page={index}>
                        <img
                            style={{
                                visibility: isLoaded ? "visible" : "hidden",
                                margin: app.pageMargin(),
                                width: app.pageWidth(),
                                height: app.pageHeight()
                            }}
                            className={"PageImage"}
                            onLoad={onImageLoaded}
                            src={
                                process.env.PUBLIC_URL +
                                "/qpages_1260/page" +
                                imageName +
                                ".png"
                            }
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
