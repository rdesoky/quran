import React from "react";
import { useDispatch } from "react-redux";
import { Redirect, useParams } from "react-router-dom";
import { ayaIdPage } from "../../services/QData";
import { selectAya } from "../../store/navSlice";
import "./Pager.scss";

export default function PageRedirect() {
    const params = useParams();
    const dispatch = useDispatch();
    let { aya } = params;
    let pageNum = 1;

    if (aya !== undefined) {
        setTimeout(() => {
            // app.selectAya(parseInt(aya));
            dispatch(selectAya(parseInt(aya)));
        }, 10);
        pageNum = ayaIdPage(aya) + 1;
    }
    return <Redirect to={process.env.PUBLIC_URL + "/page/" + pageNum} />;
}
