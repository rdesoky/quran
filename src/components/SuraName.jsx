import useSuraName from "../hooks/useSuraName";

export default function SuraName({ index }) {
    const suraName = useSuraName(index);
    return <>{suraName}</>;
}
