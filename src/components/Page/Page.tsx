/*
* Page.tsx
* This component renders a Quran page with its image and verse segments.
* It handles downloading the page image and fetching verse information.

Page
├── PageFrame
│   ├── PageImageFrame
│   │   ├── HifzSegments
│   │   ├── VerseLayout
│   │   │   ├── VerseInfo (dynamic data)
│   │   │   └── img (PageImage)

*
*/

import { HifzSegments } from "@/components/HifzSegments";
import { ayaID } from "@/services/qData";
import { downloadPageImage } from "@/services/utils";
import {
    selectActivePage,
    selectPageHeight,
    selectPageMargin,
    selectPagesCount,
    selectPageWidth,
    selectShownPages,
} from "@/store/layoutSlice";
import { hideMenu, selectMenuExpanded } from "@/store/uiSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "@/components/Page/Page.scss";
import VerseLayout from "@/components/Page/VerseLayout";
import { gotoPage } from "@/store/navSlice";
import { useHistory } from "@/hooks/useHistory";
import { PageHeader } from "../Pager/PageHeader";

type PageProps = {
    order: 0 | 1; //0 for right page, 1 for left page
    scaleX: number;
    shiftX: number;
    incrementMask: () => void;
};

// type VerseInfo = Omit<PageVerse, "epos"> & { epos: number; aya_id: number };

const Page = ({ order, scaleX, shiftX, incrementMask }: PageProps) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [versesInfo, setVersesInfo] = useState<VerseInfo[]>([]);
    const pagesCount = useSelector(selectPagesCount);
    const dispatch = useDispatch();
    const pageMargin = useSelector(selectPageMargin);
    const pageHeight = useSelector(selectPageHeight);
    const pageWidth = useSelector(selectPageWidth);
    const menuExpanded = useSelector(selectMenuExpanded);
    const shownPages = useSelector(selectShownPages);
    const activePage = useSelector(selectActivePage);
    const pageIndex = shownPages[order];
    const history = useHistory();

    const textAlign: CanvasTextAlign =
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
            })
            .catch((e) => {});
        setVersesInfo([]);
        let pageNumber = Number(pageIndex) + 1;
        // let controller = new AbortController();
        let url = `${location.origin}${
            import.meta.env.BASE_URL
        }pg_map/pm_${pageNumber}.json`;
        fetch(url, {
            // signal: controller.signal,
        })
            .then((response) => response.json())
            .then(({ child_list }: { child_list: PageVerse[] }) => {
                if (cancelled) {
                    return;
                }
                setVersesInfo(
                    child_list.map((c: PageVerse) => {
                        const aya_id = ayaID(c.sura, c.aya);
                        let epos = Number(c.epos);
                        if (epos > 980) {
                            epos = 1000; //?? why is this needed?
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

    if (order + 1 > shownPages.length) {
        return; //not enough pages
    }

    function onClickPage() {
        if (activePage !== pageIndex) {
            dispatch(gotoPage(history, pageIndex));
            // console.log(`Set active page: ${thisPageIndex + 1}`);
        }
    }

    let pageClass = pageIndex % 2 === 0 ? "RightPage" : "LeftPage";

    return (
        <div
            onClick={onClickPage}
            className={"PageSide"
                .appendWord(pageClass)
                .appendWord("active", activePage === pageIndex)}
            style={{
                width: 100 / pagesCount + "%",
            }}
            key={pageIndex}
        >
            <div className="Page">
                <div
                    className="PageFrame"
                    onClick={() => {
                        if (menuExpanded) {
                            dispatch(hideMenu());
                        }
                    }}
                    style={{
                        textAlign,
                    }}
                >
                    <PageHeader {...{ order }} />
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
                        <HifzSegments
                            page={pageIndex}
                            versesInfo={versesInfo}
                        />
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
                                    location.origin +
                                        import.meta.env.BASE_URL +
                                        "images/page_loader.png"
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
        </div>
    );
};

export default Page;
