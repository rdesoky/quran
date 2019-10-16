import React from "react";
import { AppConsumer } from "../../context/App";
import { FormattedMessage as String } from "react-intl";

const PageFooter = ({ index: pageIndex, app, order }) => {
    const showGotoPopup = e => {
        app.setPopup("Goto");
    };

    let textAlign =
        app.pagesCount === 1 ? "center" : order === 0 ? "left" : "right";

    return (
        <div className="PageFooter" style={{ textAlign }}>
            <div
                className="PageHeaderContent"
                style={{
                    width: app.pageWidth(),
                    margin: "25px 20px 0"
                }}
            >
                <String id="pg">
                    {pg => (
                        <button onClick={showGotoPopup} style={{ zIndex: 2 }}>
                            {pg}: {pageIndex + 1}
                        </button>
                    )}
                </String>
            </div>
        </div>
    );
};

export default AppConsumer(PageFooter);
