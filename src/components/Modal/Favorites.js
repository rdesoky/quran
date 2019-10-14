import React, { useEffect, useState } from "react";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer } from "./../../context/App";
import QData from "./../../services/QData";

const Favorites = ({ app }) => {
    const { user, hifzRanges } = app;
    const [showLogin, setShowLogin] = useState(false);

    const gotoSuraPage = ({ target }) => {
        const sura = parseInt(target.getAttribute("sura"));
        const startPage = parseInt(target.getAttribute("startpage"));
        const endPage = parseInt(target.getAttribute("endpage"));
        const suraStartPage = QData.sura_info[sura].sp - 1;
        const suraEndPage = QData.sura_info[sura].ep - 1;
        const suraStartAya = QData.ayaID(sura, 0);
        app.gotoPage(startPage + 1);
        if (suraStartPage === startPage) {
            app.setSelectStart(suraStartAya);
        } else {
            app.setSelectStart(QData.pageAyaId(startPage));
        }
        if (suraEndPage === endPage) {
            app.setSelectEnd(suraStartAya + QData.sura_info[sura].ac - 1);
        } else {
            app.setSelectEnd(QData.pageAyaId(endPage + 1) - 1);
        }
    };

    const rangeStartAya = (sura, page) => {
        const suraStartPage = QData.sura_info[sura].sp - 1;
        if (suraStartPage === page) {
            return QData.ayaID(sura, 0);
        } else {
            return QData.pageAyaId(page);
        }
    };

    return (
        <>
            <div className="Title">
                <String id="favorites" />
            </div>
            <div
                className="PopupBody"
                style={{ maxHeight: app.appHeight - 85 }}
            >
                <div className="buttonsBar">
                    <button>
                        <String id="add_hifz" />
                    </button>
                </div>
            </div>
        </>
    );
};

export default AppConsumer(Favorites);
