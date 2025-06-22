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
    appendWord(word: string, condition?: boolean): string;
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
    sp: number; // start page
    ep: number; // end page
    ac: number; // aya count
    t?: number;
    id?: number;
    name?: string;
    hifz?: boolean; // is hifz sura
};

type PageInfo = {
    s: number; // sura
    a: number; // aya
};

type PageVerse = {
    id: string;
    page: string;
    aya: string;
    sura: string;
    sline: string;
    eline: string;
    spos: string;
    epos: string;
};

type AudioServerId =
    | "everyayah"
    | "egylist_vaudio"
    | "egylist"
    | "quranicaudio"
    | "quranicaudio_complete"
    | "islamway_mp3";

type ReciterID =
    | "ali_jaber"
    | "baset"
    | "baset_tgw"
    | "ibr_kd"
    | "agmy"
    | "noaenee"
    | "matrood"
    | "abasfar"
    | "hozefee"
    | "m_ayoub"
    | "mjebreel"
    | "menshawee"
    | "tablawee"
    | "hosaree"
    | "affassi"
    | "ghamdi"
    | "h_refaae"
    | "alqassem"
    | "alili"
    | "husary_tgw"
    | "moaelaqi"
    | "banna"
    | "swaid"
    | "dossary"
    | "swaisy"
    | "juhaynee"
    | "alqatami"
    | "qahtanee";

type ReciterInfo = {
    on?: boolean;
    ayaAudio: ServerInfo;
    suraAudio?: ServerInfo;
    url?: string;
    actv?: string;
    rw?: number;
};

type ServerInfo = {
    server: AudioServerId;
    rkey: string;
    actv?: string;
    rw?: number;
};
