import "@/components/Pager/Pager.scss";
import { ayaIdPage } from "@/services/qData";
import { selectAya } from "@/store/navSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router";

export default function PageRedirect() {
    const params = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const { aya } = params;
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
    }, [params, dispatch, navigate]);

    return null;
}
