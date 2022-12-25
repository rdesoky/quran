import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ayaID } from "../../services/QData";
import { downloadPageImage } from "../../services/utils";
import {
    selectPageHeight,
    selectPageMargin,
    selectPagesCount,
    selectPageWidth,
} from "../../store/layoutSlice";
import { hideMenu, selectMenuExpanded } from "../../store/uiSlice";
import { HifzSegments } from "../HifzSegments";
import Spinner from "../Spinner/Spinner";
import "./Page.scss";
import PageHeader from "./PageHeader";
import VerseLayout from "./VerseLayout";

const Page = ({
    index: pageIndex,
    order,
    onArrowKey,
    onPageUp,
    onPageDown,
    scaleX,
    shiftX,
}) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [versesInfo, setVerseInfo] = useState([]);
    const pagesCount = useSelector(selectPagesCount);
    const dispatch = useDispatch();
    const pageMargin = useSelector(selectPageMargin);
    const pageHeight = useSelector(selectPageHeight);
    const pageWidth = useSelector(selectPageWidth);
    const menuExpanded = useSelector(selectMenuExpanded);

    let textAlign =
        pagesCount === 1 ? "center" : order === 0 ? "left" : "right";

    //Handle pageIndex update
    useEffect(() => {
        let setImageTimeout;
        setImageUrl(null);
        const pgIndex = pageIndex;
        downloadPageImage(pgIndex)
            .then((url) => {
                setImageTimeout = setTimeout(() => {
                    //don't update the Url state unless the component is mounted
                    if (pgIndex === pageIndex) {
                        setImageUrl(url);
                    }
                }, 100); //The delay is to make sure imageLoaded is set after index update event handler

                //onImageLoaded(url, pgIndex);
            })
            .catch((e) => {});
        setVerseInfo([]);
        let pageNumber = parseInt(pageIndex) + 1;
        let controller = new AbortController();
        let url = `${process.env.PUBLIC_URL}/pg_map/pm_${pageNumber}.json`;
        fetch(url, {
            signal: controller.signal,
        })
            .then((response) => response.json())
            .then(({ child_list }) => {
                setVerseInfo(
                    child_list.map((c) => {
                        const aya_id = ayaID(c.sura, c.aya);
                        let epos = c.epos;
                        if (epos > 980) {
                            epos = 1000;
                        }
                        return { ...c, epos, aya_id };
                    })
                );
            })
            .catch((e) => {
                const { name, message } = e;
                console.info(`${name}: ${message}\n${url}`);
            });
        return () => {
            //Cleanup function
            controller.abort();
            if (setImageTimeout !== undefined) {
                clearTimeout(setImageTimeout);
            }
        };
    }, [pageIndex]);

    return (
        <div className="Page">
            <Spinner visible={imageUrl === null} />
            <div
                className="PageFrame"
                onClick={(e) => {
                    if (menuExpanded) {
                        dispatch(hideMenu());
                    }
                }}
                style={{
                    textAlign,
                    visibility: imageUrl ? "visible" : "hidden",
                }}
            >
                <div
                    className={
                        "PageImageFrame" + (imageUrl ? " AnimatePage" : "")
                    }
                    style={{
                        transform: `translateX(${shiftX || 0}px) scaleX(${
                            scaleX || 1
                        })`,
                        // transform: `translateX(${shiftX || 0}px) scaleX(1)`,
                    }}
                >
                    <HifzSegments page={pageIndex} versesInfo={versesInfo} />
                    <VerseLayout
                        page={pageIndex}
                        pageWidth={pageWidth}
                        versesInfo={versesInfo}
                    >
                        <img
                            style={{
                                visibility: imageUrl ? "visible" : "hidden",
                                margin: pageMargin,
                                width: pageWidth,
                                height: pageHeight,
                            }}
                            src={imageUrl}
                            className="PageImage"
                            alt="page"
                        />
                    </VerseLayout>
                </div>
            </div>
            <PageHeader
                index={pageIndex}
                order={order}
                // onIncrement={onIncrement}
                // onDecrement={onDecrement}
                // offsetSelection={offsetSelection}
                onArrowKey={onArrowKey}
                onPageUp={onPageUp}
                onPageDown={onPageDown}
            />
        </div>
    );
};

export default Page;
