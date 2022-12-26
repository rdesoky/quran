import { useDispatch, useSelector } from "react-redux";
import { gotoPart } from "../store/navSlice";
import { useHistory } from "react-router-dom";
import { selectActivePage } from "../store/layoutSlice";
import { getPagePartNumber } from "../services/QData";

export default function PartsPie() {
    const history = useHistory();
    const dispatch = useDispatch();
    const pageIndex = useSelector(selectActivePage);
    const partIndex = getPagePartNumber(pageIndex + 1) - 1;

    const boxSize = 300;
    const radius = boxSize / 2;
    const parts = new Array(30).fill(0).map((i, index) => {
        return `rgba(12, 82, 12, ${(index + 15) / 60})`;
    });
    const center = { x: radius, y: radius };
    const arcStrokeWidth = 50;
    const arcRadius = radius - arcStrokeWidth / 2;
    const dashBorderLength = Math.PI * (arcRadius * 2);
    const partDashLength = dashBorderLength / parts.length;
    const textAngleShift = 360 / parts.length / 2;
    return (
        <div className="PartsPie">
            <svg
                {...{
                    viewBox: `0 0 ${boxSize} ${boxSize}`,
                }}
            >
                <circle
                    cx={center.x}
                    cy={center.y}
                    r={radius - arcStrokeWidth / 2}
                    strokeWidth={arcStrokeWidth}
                    stroke="white"
                    fill="none"
                />
                {parts.map((color, index) => {
                    const strokeArray = [
                        0, //draw nothing
                        partDashLength * index, //shifting the drawing offset
                        partDashLength, //drawing pie length
                        10000, //skip the rest of the circle
                    ];
                    const partAngel =
                        (index * 360) / parts.length + textAngleShift;
                    const xTextShift =
                        arcRadius * Math.sin((partAngel * Math.PI) / 180);
                    const angel2 = (180 - partAngel) / 2;
                    const angel3 = 180 - 90 - angel2;
                    const yTextShift =
                        xTextShift * Math.tan((angel3 * Math.PI) / 180);
                    const textSize = { w: 0, h: 55 };
                    return (
                        <>
                            <circle
                                key={index}
                                strokeWidth={arcStrokeWidth}
                                stroke={["#aaa", "#888"][index % 2]}
                                fill="none"
                                r={radius - arcStrokeWidth / 2}
                                cx={center.x}
                                cy={center.y}
                                strokeDasharray={strokeArray.join(" ")}
                                transform={`rotate(-90) translate(-${boxSize})`}
                            />
                            <text
                                x={textSize.w / 2 + center.x + xTextShift}
                                y={textSize.h / 2 + yTextShift}
                                textAnchor="middle"
                                alignment-baseline="middle"
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
                    cx={center.x}
                    cy={center.y}
                    r={30}
                    strokeWidth={0}
                    fill="gray"
                />
                <text
                    x={center.x}
                    y={center.y}
                    textAnchor="middle"
                    alignment-baseline="middle"
                    style={{ cursor: "pointer" }}
                    onClick={() => dispatch(gotoPart(history, partIndex))}
                >
                    {partIndex + 1}
                </text>
            </svg>
        </div>
    );
}
