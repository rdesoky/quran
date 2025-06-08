export function polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
) {
    var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
}

export function describeArc({
    x,
    y,
    r: radius,
    a1: startAngle,
    a2: endAngle,
}: {
    x: number;
    y: number;
    r: number;
    a1: number;
    a2: number;
}) {
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M",
        start.x,
        start.y,
        "A",
        radius,
        radius,
        0,
        largeArcFlag,
        0,
        end.x,
        end.y,
    ].join(" ");

    return d;
}

export const rotatePoint = (radius: number, angleInDegrees: number) => {
    const angleInRadians = (degree: number) => (degree * Math.PI) / 180.0;
    const dx = radius * Math.sin(angleInRadians(angleInDegrees));
    const dy = dx * Math.tan(angleInRadians(90 - (180 - angleInDegrees) / 2));
    return {
        dx,
        dy,
    };
};
