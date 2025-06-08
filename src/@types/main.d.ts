type Msg = {
    type: "info" | "error" | "warning" | "success";
    title?: string;
    content: string;
    key?: number;
    onClose?: () => void;
};

type NewRange = {
    startPage: number;
    endPage: number;
    pages: number;
    revs: number;
};

type HifzRange = NewRange & {
    id: string;
    sura: number;
    date: number;
};

type Bookmark = {
    // id: number;
    aya: string;
    ts: number;
};

type DailyActivity = {
    id: string;
    date: string;
    pages: number;
    chars: number;
};

interface Number {
    between(min: number, max: number): boolean;
}
interface String {
    appendWord(word: string, condition: boolean): String;
}

type PartInfo = {
    s: number;
    a: number;
    es: number;
    ea: number;
    p: number;
    ep: number;
    h: number[];
};

type SuraInfo = {
    id: number;
    name: string;
    sp: number; // start page
    ep: number; // end page
    ac: number; // aya count
    hifz?: boolean; // is hifz sura
};

type PageInfo = {
    s: number; // sura
    a: number; // aya
};
