//TODO: unused
import {
    faChevronLeft,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { analytics } from "@/services/analytics";
import { TOTAL_PAGES } from "@/services/qData";
import { selectActivePage } from "@/store/layoutSlice";
import { gotoPage } from "@/store/navSlice";

export const PageNavigator = ({ children, trigger }) => {
    const pageIndex = useSelector(selectActivePage);
    const dispatch = useDispatch();
    const history = useHistory();

    const stopPropagation = (e) => e.stopPropagation();

    const gotoNextPage = (e) => {
        dispatch(gotoPage(history, pageIndex + 1));
        analytics.logEvent("nav_next_page", { trigger });
    };

    const gotoPrevPage = (e) => {
        dispatch(gotoPage(history, pageIndex - 1));
        analytics.logEvent("nav_prev_page", { trigger });
    };

    return (
        <div className="SuraNavigator" onClick={stopPropagation}>
            {pageIndex > 0 ? (
                <button className="CommandButton" onClick={gotoPrevPage}>
                    <Icon icon={faChevronRight} />
                </button>
            ) : null}
            {children}
            {pageIndex + 1 < TOTAL_PAGES ? (
                <button className="CommandButton" onClick={gotoNextPage}>
                    <Icon icon={faChevronLeft} />
                </button>
            ) : null}
        </div>
    );
};
