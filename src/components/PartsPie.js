import { useContext } from "react";
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { AppRefs } from "../RefsProvider";
import { getPagePartNumber, TOTAL_PAGES, TOTAL_PARTS } from "../services/QData";
import { describeArc, rotatePoint } from "../services/svg";
import { dayLength, getHifzRangeDisplayInfo } from "../services/utils";
import { selectHifzRanges } from "../store/dbSlice";
import { selectActivePage } from "../store/layoutSlice";
import { gotoPage, gotoPart } from "../store/navSlice";

export default function PartsPie({ size = 300 }) {
    const history = useHistory();
    const dispatch = useDispatch();
    const hifzRanges = useSelector(selectHifzRanges);
    const pageIndex = useSelector(selectActivePage);
    const partIndex = getPagePartNumber(pageIndex + 1) - 1;
    const intl = useIntl();
    const suraNames = useContext(AppRefs).get("suraNames").suraNames;

    const boxSize = size;
    const radius = boxSize / 2;
    const parts = new Array(TOTAL_PARTS).fill(0);
    const cx = radius;
    const cy = radius;
    const partsStrokeWidth = 50;
    const hifzDonutStrokeWidth = 16;
    const hifzDonutRadius = boxSize / 2 - hifzDonutStrokeWidth / 2;
    const partsRadius =
        hifzDonutRadius - hifzDonutStrokeWidth / 2 - partsStrokeWidth / 2;
    const selectedPartRadius = 16;
    const hizbRadius = 40;
    const hizbStrokWidth = 40;
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
                {parts.map((p, index) => {
                    const { dx: dxPartNum, dy: dyPartNum } = rotatePoint(
                        partsRadius,
                        ((index + 0.5) * 360.0) / parts.length
                    );
                    return (
                        <>
                            <path
                                className={`partPie ${
                                    ["even", "odd"][index % 2]
                                }`}
                                d={describeArc({
                                    x: cx,
                                    y: cy,
                                    r: partsRadius,
                                    a1: (index * 360) / 30,
                                    a2: ((index + 1) * 360) / 30,
                                })}
                                style={{
                                    fill: "none",
                                    strokeWidth: partsStrokeWidth,
                                }}
                                onClick={() =>
                                    dispatch(gotoPart(history, index))
                                }
                            />

                            <text
                                key={`text-${index}`}
                                x={cx + dxPartNum}
                                y={cy - partsRadius + dyPartNum}
                                textAnchor="middle"
                                // alignmentBaseline="central"
                                dy=".4em"
                                style={{
                                    pointerEvents: "none",
                                    fontSize: 12,
                                    fontWeight: "bold",
                                }}
                            >
                                {index + 1}
                            </text>
                        </>
                    );
                })}
                <circle
                    className="hifzPieBackground"
                    style={{
                        cx,
                        cy,
                        r: hifzDonutRadius,
                        strokeWidth: hifzDonutStrokeWidth,
                        fill: "none",
                    }}
                />
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
                            className={`hifzPie ${ageClass}`}
                            d={describeArc({
                                x: cx,
                                y: cy,
                                r: hifzDonutRadius,
                                a1,
                                a2,
                            })}
                            style={{
                                fill: "none",
                                strokeWidth: hifzDonutStrokeWidth,
                            }}
                            onClick={() =>
                                dispatch(gotoPage(history, r.startPage))
                            }
                        >
                            <title>
                                {suraNames[r.sura]} - {title}
                                {ageText ? ` - ${ageText}` : ""}
                            </title>
                        </path>
                    );
                })}
                <circle
                    className="partsPieCenter"
                    style={{
                        cx,
                        cy,
                        r: selectedPartRadius,
                        strokeWidth: 0,
                        fill: "#aaa",
                        cursor: "pointer",
                    }}
                    onClick={() => dispatch(gotoPart(history, partIndex))}
                />
                <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    // alignmentBaseline="central"
                    dy=".4em"
                    style={{ pointerEvents: "none" }}
                >
                    {partIndex + 1}
                </text>
                {[1, 2, 3, 4].map((h, index) => {
                    const { dx: dxHizbNum, dy: dyHizbNum } = rotatePoint(
                        hizbRadius,
                        ((index + 0.5) * 360.0) / 4
                    );

                    return (
                        <>
                            <path
                                className={`hizbQuarterPie ${
                                    ["even", "odd"][index % 2]
                                }`}
                                d={describeArc({
                                    x: cx,
                                    y: cy,
                                    r: hizbRadius,
                                    a1: index * 90,
                                    a2: (index + 1) * 90,
                                })}
                                fill="none"
                                style={{ strokeWidth: hizbStrokWidth }}
                            >
                                <title>Hizb</title>
                            </path>
                            <text
                                x={cx + dxHizbNum}
                                y={cy - hizbRadius + dyHizbNum}
                                textAnchor="middle"
                                alignmentBaseline="central"
                                style={{ pointerEvents: "none" }}
                            >
                                {h}
                            </text>
                        </>
                    );
                })}
            </svg>
        </div>
    );
}
