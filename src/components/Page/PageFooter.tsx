//TODO: unused
import { FormattedMessage as String } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { selectPageWidth } from "@/store/layoutSlice";
import { showPopup } from "@/store/uiSlice";

type PageFooterProps = {
    index: number;
};

const PageFooter = ({ index: pageIndex }: PageFooterProps) => {
    // const location = useLocation();
    // const pagesCount = useSelector(selectPagesCount);
    const pageWidth = useSelector(selectPageWidth);
    const dispatch = useDispatch();
    const showGotoPopup = () => {
        // app.setPopup("Goto");
        dispatch(showPopup("Goto"));
    };

    // let textAlign =
    //     pagesCount === 1 ? "center" : order === 0 ? "left" : "right";

    return (
        <div className="PageFooter">
            <div
                className="PageHeaderContent"
                style={{
                    width: pageWidth,
                    margin: "25px 20px 0",
                }}
            >
                <String id="pg">
                    {(pg) => (
                        <button onClick={showGotoPopup} style={{ zIndex: 2 }}>
                            {pg}: {pageIndex + 1}
                        </button>
                    )}
                </String>
            </div>
        </div>
    );
};

export default PageFooter;
