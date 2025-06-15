export default function UpdateBadge() {
    return (
        <div
            style={{
                position: "absolute",
                width: 10,
                height: 10,
                top: 2,
                right: 2,
                lineHeight: 0,
                pointerEvents: "none",
            }}
        >
            <svg
                {...{
                    viewBox: `0 0 20 20`,
                }}
            >
                <circle
                    {...{ cx: 10, cy: 10, r: 10, fill: "red", stroke: "none" }}
                />
            </svg>
        </div>
    );
}
