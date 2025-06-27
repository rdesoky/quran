import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router";
import { ayaIdPage } from "@/services/qData";
import { selectAya } from "@/store/navSlice";
import "@/components/Pager/Pager.scss";

export default function PageRedirect() {
    const params = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        let { aya } = params;
        let pageNum = 1;
        if (aya !== undefined) {
            setTimeout(() => {
                // app.selectAya(parseInt(aya));
                dispatch(selectAya(Number(aya)));
            }, 10);
            pageNum = ayaIdPage(Number(aya)) + 1;
        }
        navigate(`/page/${pageNum}`, {
            replace: true,
        });
    }, [params, dispatch]);

    return null;
}
