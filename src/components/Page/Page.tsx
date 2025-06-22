import { HifzSegments } from "@/components/HifzSegments";
import { ayaID } from "@/services/qData";
import { downloadPageImage } from "@/services/utils";
import {
    selectPageHeight,
    selectPageMargin,
    selectPagesCount,
    selectPageWidth,
} from "@/store/layoutSlice";
import { hideMenu, selectMenuExpanded } from "@/store/uiSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Page.scss";
import VerseLayout from "@/components/Page/VerseLayout";

type PageProps = {
    index: number;
    order: number;
    scaleX: number;
    shiftX: number;
    incrementMask: () => void;
};

type VerseInfo = Omit<PageVerse, "epos"> & { epos: number; aya_id: number };

const Page = ({
    index: pageIndex,
    order,
    scaleX,
    shiftX,
    incrementMask,
}: PageProps) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [versesInfo, setVersesInfo] = useState<VerseInfo[]>([]);
    const pagesCount = useSelector(selectPagesCount);
    const dispatch = useDispatch();
    const pageMargin = useSelector(selectPageMargin);
    const pageHeight = useSelector(selectPageHeight);
    const pageWidth = useSelector(selectPageWidth);
    const menuExpanded = useSelector(selectMenuExpanded);

    let textAlign: CanvasTextAlign =
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
    );
};

export default Page;
