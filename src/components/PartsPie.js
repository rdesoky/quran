import { useContext, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { AppRefs } from "../RefsProvider";
import {
    getHezbByAya,
    getPartFirstAyaId,
    getPartIndexByAyaId,
    hezbInfo,
    rangeStartAya,
    TOTAL_PAGES,
    TOTAL_PARTS,
} from "../services/QData";
import { describeArc, rotatePoint } from "../services/svg";
import { dayLength, getHifzRangeDisplayInfo } from "../services/utils";
import { selectHifzRanges } from "../store/dbSlice";
import { gotoAya, selectStartSelection } from "../store/navSlice";

export default function PartsPie({ size, onFinish }) {
    const history = useHistory();
    const dispatch = useDispatch();
    const [activePartIndex, setActivePartIndex] = useState(0);
    const hifzRanges = useSelector(selectHifzRanges);
    const selectedAya = useSelector(selectStartSelection);
    const selectedHezb = getHezbByAya(selectedAya);
    const selectedPartIndex = getPartIndexByAyaId(selectedAya);
    const intl = useIntl();
    const suraNames = useContext(AppRefs).get("suraNames").suraNames;
    const contextPopup = useContext(AppRefs).get("contextPopup");

    const onNavigate = () => {
        onFinish ? onFinish() : contextPopup.close();
    };

    useEffect(() => {
        setActivePartIndex(selectedPartIndex);
    }, [selectedPartIndex]);

    const boxSize = 300;
    const radius = boxSize / 2;
    const parts = new Array(TOTAL_PARTS).fill(0);
    const partHezbs = new Array(8).fill(0);
    const cx = radius;
    const cy = radius;
    const hifzStrokeWidth = 20;
    const hifzRadius = radius - hifzStrokeWidth / 2;
    const partsStrokeWidth = 50;
    const partsRadius = hifzRadius - hifzStrokeWidth / 2 - partsStrokeWidth / 2;
    const hezbStrokeWidth = 50;
    const hezbRadius =
        partsRadius - partsStrokeWidth / 2 - hezbStrokeWidth / 2 + 1; //adding 1 to erase border
    const partPieAngel = 360.0 / TOTAL_PARTS;
    const activePartAngel = activePartIndex * partPieAngel;
    return (
        <div
            className="PartsPie"
            style={{ width: size, height: size }}
            onClick={(e) => e.stopPropagation()}
        >
            <svg
                {...{
                    viewBox: `0 0 ${boxSize} ${boxSize}`,
                }}
            >
                <circle
                    className="hifzPieBackground"
                    style={{
                        cx,
                        cy,
                        r: radius,
                    }}
                ></circle>
                {parts.map((p, index) => {
                    const { dx: dxPartNum, dy: dyPartNum } = rotatePoint(
                        partsRadius,
                        (index + 0.5) * partPieAngel
                    );
                    return (
                        <>
                            <path
                                key={`path-${index}`}
                                className={`partPie ${
                                    index === activePartIndex ? "active" : ""
                                } ${
                                    index === selectedPartIndex
                                        ? "selected"
                                        : ""
                                }`}
                                d={describeArc({
                                    x: cx,
                                    y: cy,
                                    r: partsRadius,
                                    a1: index * partPieAngel,
                                    a2: (index + 1) * partPieAngel - 0.2,
                                })}
                                style={{
                                    fill: "none",
                                    strokeWidth: partsStrokeWidth,
                                }}
                                onClick={() => {
                                    if (activePartIndex !== index) {
                                        setActivePartIndex(index);
                                    } else {
                                        dispatch(
                                            gotoAya(
                                                history,
                                                getPartFirstAyaId(index)
                                            )
                                        );
                                        onNavigate();
                                    }
                                }}
                            >
                                <title>
                                    <FormattedMessage
                                        id="part_num"
                                        values={{ num: activePartIndex + 1 }}
                                    />
                                </title>
                            </path>

                            <text
                                key={`text-${index}`}
                                className="piePartNumber"
                                x={cx + dxPartNum}
                                y={cy - partsRadius + dyPartNum}
                                textAnchor="middle"
                                // alignmentBaseline="central"
                                dy=".4em"
                            >
                                {index + 1}
                            </text>
                        </>
                    );
                })}
                {hifzRanges.map((r, index) => {
                    const a1 = (360.0 * r.startPage) / TOTAL_PAGES;
                    const a2 = a1 + (360.0 * r.pages) / TOTAL_PAGES;
                    const age = Math.floor((Date.now() - r.date) / dayLength);
                    const ageClass =
                        age <= 7
                            ? "GoodHifz"
                            : age <= 14
                            ? "FairHifz"
                            : "WeakHifz";
                    const { title, ageText } = getHifzRangeDisplayInfo(r, intl);

                    return (
                        <path
                            key={index}
                            className={`pieHifzRange ${ageClass}`}
                            d={describeArc({
                                x: cx,
                                y: cy,
                                r: hifzRadius,
                                a1,
                                a2,
                            })}
                            style={{
                                fill: "none",
                                strokeWidth: hifzStrokeWidth,
                            }}
                            onClick={() => {
                                dispatch(gotoAya(history, rangeStartAya(r)));
                                onNavigate();
                            }}
                        >
                            <title>
                                {suraNames[r.sura]} - {title}
                                {ageText ? ` - ${ageText}` : ""}
                            </title>
                        </path>
                    );
                })}
                {partHezbs.map((i, index) => {
                    const hezbAngel = 270.0 / 8;
                    const { dx: dxHezbNum, dy: dyHezbNum } = rotatePoint(
                        hezbRadius,
                        activePartAngel + (index + 0.5) * hezbAngel
                    );
                    const hInfo = hezbInfo(activePartIndex, index);
                    return (
                        <>
                            <path
                                key={`path.${index}`}
                                className={`hezbQuarterPie ${
                                    selectedHezb.absIndex ===
                                    index + activePartIndex * 8
                                        ? "selected"
                                        : ""
                                }`}
                                d={describeArc({
                                    x: cx,
                                    y: cy,
                                    r: hezbRadius,
                                    a1: activePartAngel + index * hezbAngel,
                                    a2:
                                        activePartAngel +
                                        (index + 1) * hezbAngel -
                                        0.3,
                                })}
                                fill="none"
                                style={{ strokeWidth: hezbStrokeWidth }}
                                onClick={() => {
                                    dispatch(gotoAya(history, hInfo.aya));
                                    onNavigate();
                                }}
                            >
                                <title>
                                    <FormattedMessage
                                        id="hezb_num"
                                        values={{
                                            qr: hInfo.quarterText,
                                            num: hInfo.index + 1,
                                        }}
                                    />
                                </title>
                            </path>
                            <text
                                key={`text.${index}`}
                                className="pieHezbNumber"
                                x={cx + dxHezbNum}
                                y={cy - hezbRadius + dyHezbNum}
                                textAnchor="middle"
                                alignmentBaseline="central"
                            >
                                {hInfo.text}
                            </text>
                        </>
                    );
                })}
            </svg>
        </div>
    );
}
