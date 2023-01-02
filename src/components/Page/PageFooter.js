//TODO: unused
import React from "react";
import { FormattedMessage as String } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { selectPagesCount } from "../../store/app";
import { selectPageWidth } from "../../store/layoutSlice";
import { showPopup } from "../../store/uiSlice";

const PageFooter = ({ index: pageIndex, order }) => {
    // const location = useLocation();
    const pagesCount = useSelector(selectPagesCount);
    const pageWidth = useSelector(selectPageWidth);
    const dispatch = useDispatch();
    const showGotoPopup = (e) => {
        // app.setPopup("Goto");
        dispatch(showPopup("Goto"));
    };

    let textAlign =
        pagesCount === 1 ? "center" : order === 0 ? "left" : "right";

    return (
        <div className="PageFooter" style={{ textAlign }}>
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
