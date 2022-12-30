import { useContext } from "react";
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { AppRefs } from "../RefsProvider";
import { getPagePartNumber, TOTAL_PAGES, TOTAL_PARTS } from "../services/QData";
import { describeArc } from "../services/svg";
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
    const arcStrokeWidth = 50;
    const arcRadius = radius - arcStrokeWidth / 2;
    const centerButtonRadius = 28;

    const textAngleShift = 360 / parts.length / 2;
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
                    // const strokeDashoffset =
                    //     dashBorderLength / 4 - partDashLength * index;

                    // const strokeDasharray = [
                    //     partDashLength, //drawing pie length
                    //     dashBorderLength - partDashLength, //skip the rest of the circle
                    // ].join(" ");
                    const partAngel =
                        (index * 360) / parts.length + textAngleShift;
                    const xTextShift =
                        arcRadius * Math.sin((partAngel * Math.PI) / 180);
                    const angel2 = (180 - partAngel) / 2;
                    const angel3 = 180 - 90 - angel2;
                    const yTextShift =
                        xTextShift * Math.tan((angel3 * Math.PI) / 180);
                    const textSize = { w: 0, h: arcStrokeWidth };

                    return (
                        <>
                            <path
                                className={`partPie ${
                                    ["even", "odd"][index % 2]
                                }`}
                                d={describeArc({
                                    x: cx,
                                    y: cy,
                                    r: radius - arcStrokeWidth / 2,
                                    a1: (index * 360) / 30,
                                    a2: ((index + 1) * 360) / 30,
                                })}
                                style={{
                                    fill: "none",
                                    strokeWidth: arcStrokeWidth,
                                    // strokeLinecap: "round",
                                    // strokeLinejoin: "round",
                                }}
                                onClick={() =>
                                    dispatch(gotoPart(history, index))
                                }
                            />

                            <text
                                key={`text-${index}`}
                                x={cx + textSize.w / 2 + xTextShift}
                                y={textSize.h / 2 + yTextShift}
                                textAnchor="middle"
                                // alignmentBaseline="central"
                                dy=".4em"
                                style={{ pointerEvents: "none" }}
                            >
                                {index + 1}
                            </text>
                        </>
                    );
                })}
                <circle
                    className="hifzPieBackground"
                    style={{ cx, cy, r: 80, strokeWidth: 16 }}
                />
                {hifzRanges.map((r, index) => {
                    const a1 = Math.floor((360 * r.startPage) / TOTAL_PAGES);
                    const a2 =
                        a1 + (Math.floor((360 * r.pages) / TOTAL_PAGES) || 1);
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
                                r: 80,
                                a1,
                                a2,
                            })}
                            style={{
                                fill: "none",
                                strokeWidth: 16,
                                // strokeLinecap: "round",
                                // strokeLinejoin: "round",
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
                        r: centerButtonRadius,
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
            </svg>
        </div>
    );
}
