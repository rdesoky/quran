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
import "./Page.scss";
import VerseLayout from "./VerseLayout";

const Page = ({ index: pageIndex, order, scaleX, shiftX, incrementMask }) => {
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
        let cancelled = false;
        let setImageTimeout;
        setImageUrl(null);
        const pgIndex = pageIndex;
        downloadPageImage(pgIndex)
            .then((url) => {
                if (cancelled) {
                    return;
                }
                setImageUrl(url);
                // setImageTimeout = setTimeout(() => {
                //     //don't update the Url state unless the component is mounted
                //     if (pgIndex === pageIndex) {
                //         setImageUrl(url);
                //     }
                // }, 1000); //The delay is to make sure imageLoaded is set after index update event handler

                //onImageLoaded(url, pgIndex);
            })
            .catch((e) => {});
        setVerseInfo([]);
        let pageNumber = parseInt(pageIndex) + 1;
        // let controller = new AbortController();
        let url = `${process.env.PUBLIC_URL}/pg_map/pm_${pageNumber}.json`;
        fetch(url, {
            // signal: controller.signal,
        })
            .then((response) => response.json())
            .then(({ child_list }) => {
                if (cancelled) {
                    return;
                }
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
            });
        return () => {
            cancelled = true;
            //Cleanup function
            // controller.abort();
            if (setImageTimeout !== undefined) {
                clearTimeout(setImageTimeout);
            }
        };
    }, [pageIndex]);

    return (
        <div className="Page">
            {/* <Spinner visible={imageUrl === null} /> */}
            <div
                className="PageFrame"
                onClick={(e) => {
                    if (menuExpanded) {
                        dispatch(hideMenu());
                    }
                }}
                style={{
                    textAlign,
                    // visibility: imageUrl ? "visible" : "hidden",
                }}
            >
                <div
                    className={"PageImageFrame".appendWord("AnimatePage")}
                    style={{
                        transform: `translateX(${shiftX || 0}px) scaleX(${
                            scaleX || 1
                        })`,
                        height: pageHeight,
                        width: pageWidth,
                        // transform: `translateX(${shiftX || 0}px) scaleX(1)`,
                    }}
                >
                    <HifzSegments page={pageIndex} versesInfo={versesInfo} />
                    <VerseLayout
                        page={pageIndex}
                        versesInfo={versesInfo}
                        incrementMask={incrementMask}
                    >
                        <img
                            style={{
                                margin: `0 ${pageMargin}px`,
                                width: pageWidth - 2 * pageMargin,
                                height: pageHeight,
                            }}
                            src={
                                imageUrl ||
                                process.env.PUBLIC_URL +
                                    "/images/page_loader.png"
                            }
                            className={"PageImage".appendWord(
                                "page-loader-image",
                                !imageUrl
                            )}
                            alt="page"
                        />
                    </VerseLayout>
                </div>
            </div>
        </div>
    );
};

export default Page;
