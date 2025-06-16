import { useContextPopup } from "@/RefsProvider";
import {
    getHezbByAya,
    getPartFirstAyaId,
    getPartIndexByAyaId,
    hezbInfo,
    rangeStartAya,
    TOTAL_PAGES,
    TOTAL_PARTS,
} from "@/services/qData";
import { describeArc, rotatePoint } from "@/services/svg";
import { dayLength, getHifzRangeDisplayInfo } from "@/services/utils";
import { selectHifzRanges } from "@/store/dbSlice";
import { gotoAya, selectStartSelection } from "@/store/navSlice";
import { selectSuraNames } from "@/store/uiSlice";
