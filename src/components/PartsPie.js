import { useDispatch, useSelector } from "react-redux";
import { gotoPart } from "../store/navSlice";
import { useHistory } from "react-router-dom";
import { selectActivePage } from "../store/layoutSlice";
import { getPagePartNumber, TOTAL_PARTS } from "../services/QData";

export default function PartsPie({ size = 300 }) {
    const history = useHistory();
    const dispatch = useDispatch();
    const pageIndex = useSelector(selectActivePage);
    const partIndex = getPagePartNumber(pageIndex + 1) - 1;

    const boxSize = size;
    const radius = boxSize / 2;
    const parts = new Array(TOTAL_PARTS).fill(0);
    const cx = radius;
    const cy = radius;
    const arcStrokeWidth = 50;
    const arcRadius = radius - arcStrokeWidth / 2;
    const dashBorderLength = Math.PI * (arcRadius * 2);
    const partDashLength = dashBorderLength / parts.length;
    const textAngleShift = 360 / parts.length / 2;
    return (
        <div className="PartsPie" style={{ width: size, height: size }}>
            <svg
                {...{
                    viewBox: `0 0 ${boxSize} ${boxSize}`,
                }}
            >
                {parts.map((p, index) => {
                    const strokeDashoffset =
                        dashBorderLength / 4 - partDashLength * index;

                    const strokeDasharray = [
                        partDashLength, //drawing pie length
                        dashBorderLength - partDashLength, //skip the rest of the circle
                    ].join(" ");
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
                            <circle
                                key={`circle-${index}`}
                                strokeWidth={arcStrokeWidth}
                                stroke={["#aaa", "#888"][index % 2]}
                                r={radius - arcStrokeWidth / 2}
                                style={{
                                    cx,
                                    cy,
                                    fill: "none",
                                    strokeDasharray,
                                    strokeDashoffset,
                                }}
                            />
                            <text
                                key={`text-${index}`}
                                x={cx + textSize.w / 2 + xTextShift}
                                y={textSize.h / 2 + yTextShift}
                                textAnchor="middle"
                                // alignmentBaseline="central"
                                dy=".4em"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                    dispatch(gotoPart(history, index))
                                }
                            >
                                {index + 1}
                            </text>
                        </>
                    );
                })}
                <circle
                    style={{ cx, cy, r: 30, strokeWidth: 0, fill: "#aaa" }}
                />
                <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    // alignmentBaseline="central"
                    dy=".4em"
                    style={{ cursor: "pointer" }}
                    onClick={() => dispatch(gotoPart(history, partIndex))}
                >
                    {partIndex + 1}
                </text>
            </svg>
        </div>
    );
}
