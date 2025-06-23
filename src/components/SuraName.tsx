import useSuraName from "@/hooks/useSuraName";

export default function SuraName({ index }: { index: number }) {
    const suraName = useSuraName(index);
    return <>{suraName}</>;
}
