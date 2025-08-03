import {
    faBackspace,
    faCheckCircle,
    faFastBackward,
    faStepBackward,
} from "@fortawesome/free-solid-svg-icons";
import React, { useCallback, useEffect, useState } from "react";
import { useMessageBox } from "@/RefsProvider";
import "@/components/AKeyboard/AKeyboard.scss";
import Icon from "@/components/Icon";

const keyMap = {
    //first
    BracketLeft: ["ج", "]"],
    KeyP: ["ح", "P"],
    KeyO: ["خ", "O"],
    KeyI: ["ه", "I"],
    KeyU: ["ع", "U"],
    KeyY: ["غ", "Y"],
    KeyT: ["ف", "T"],
    KeyR: ["ق", "R"],
    KeyE: ["ث", "E"],
    KeyW: ["ص", "W"],
    KeyQ: ["ض", "Q"],

    //second
    Quote: ["ط", "'"],
    Semicolon: ["ك", ";"],
    KeyL: ["م", "L"],
    KeyK: ["ن", "K"],
    KeyJ: ["ت", "J"],
    KeyH: ["ا", "H"],
    KeyG: ["ل", "G"],
    KeyF: ["ب", "F"],
    KeyD: ["ي", "D"],
    KeyS: ["س", "S"],
    KeyA: ["ش", "A"],

    //Third
    BracketRight: ["د", "["],
    Slash: ["ظ", "/"],
    Period: ["ز", "."],
    Comma: ["و", ","],
    KeyM: ["ة", "M"],
    KeyN: ["ى", "N"],
    KeyB: ["لا", "B"], //skip
    KeyV: ["ر", "V"],
    KeyC: ["ؤ", "C"],
    KeyX: ["ء", "X"],
    KeyZ: ["ئ", "Z"], //??

    //Forth
    Backquote: ["ذ", "`"],
    Space: [" ", "Space"],
    Backspace: [<Icon icon={faBackspace} key="Backspace" />, "Bksp"],
    ClearWord: [<Icon icon={faStepBackward} key="ClearWord" />, "Ctrl+Bksp"],
    ClearAll: [<Icon icon={faFastBackward} key="ClearAll" />, "Ctrl+x"],
    Enter: [<Icon icon={faCheckCircle} key="Enter" />, "Enter"],
};

type KeyMap = typeof keyMap;
type KeyMapKey = keyof KeyMap;

const keyRows: KeyMapKey[][] = [
    [
        "BracketLeft",
        "KeyP",
        "KeyO",
        "KeyI",
        "KeyU",
        "KeyY",
        "KeyT",
        "KeyR",
        "KeyE",
        "KeyW",
        "KeyQ",
    ],
    [
        "Quote",
        "Semicolon",
        "KeyL",
        "KeyK",
        "KeyJ",
        "KeyH",
        "KeyG",
        "KeyF",
        "KeyD",
        "KeyS",
        "KeyA",
    ],
    [
        "BracketRight",
        "Slash",
        "Period",
        "Comma",
        "KeyM",
        "KeyN",
        "KeyB",
        "KeyV",
        "KeyC",
        "KeyX",
        "KeyZ",
    ],
    ["Backspace", "Enter", "ClearWord", "Space", "ClearAll", "Backquote"],
];

type AKeyboardProps = {
    initText: string;
    onUpdateText: (text: string) => void;
    onEnter?: (text: string) => void;
    onCancel?: () => void;
    style?: React.CSSProperties;
    lang?: "ar" | "en";
};

const AKeyboard = ({
    initText,
    onUpdateText,
    onEnter,
    onCancel,
    style,
    lang = "ar",
}: AKeyboardProps) => {
    const [text, setText] = useState(initText);
    const [typedChar, setTypedChar] = useState("");
    const msgBox = useMessageBox();

    const updateText = useCallback(
        (newText: string) => {
            setText(newText);
            onUpdateText(newText);
        },
        [onUpdateText]
    );

    const langIndex = lang === "ar" ? 0 : 1;
    const secondaryLangIndex = lang === "ar" ? 1 : 0;

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (msgBox.getMessages().length) {
                return; //a message box is active
            }
            const { ctrlKey } = e;
            const code = e.code as KeyMapKey;
            const target = e.target as HTMLElement;
            setTypedChar(code);
            window.setTimeout(() => {
                setTypedChar("");
            }, 300);
            if (code === "Space") {
                //Avoid entering space when user presses a button using space bar
                if (
                    target &&
                    target.tagName.match(/input|button|select|radio|textarea/i)
                ) {
                    return;
                }
                if (text.trim().length === 0) {
                    return;
                }
            }

            switch (code as KeyMapKey | "Escape") {
                case "Escape":
                    onCancel?.();
                    break;
                case "Enter":
                    if (
                        document.activeElement?.tagName.match(
                            /input|button|select|textarea/i
                        )
                    ) {
                        return;
                    }
                    onEnter?.(text);
                    break;
                case "Backspace":
                    if (ctrlKey) {
                        setTypedChar("ClearWord");
                        updateText(text.replace(/\S+\s*$/, ""));
                    } else {
                        updateText(text.substr(0, text.length - 1));
                    }
                    break;
                case "ClearAll":
                    updateText("");
                    break;
                case "ClearWord":
                    updateText(text.replace(/\S+\s*$/, ""));
                    break;
                case "KeyX":
                    if (ctrlKey) {
                        setTypedChar("ClearAll");
                        updateText("");
                        break;
                    }
                // eslint-disable-next-line no-fallthrough
                default:
                    if (
                        keyMap[code][langIndex] &&
                        typeof keyMap[code][langIndex] === "string"
                    ) {
                        updateText(text.concat(keyMap[code][langIndex]));
                        break;
                    }
                    return; //not handled
            }
            if (e && typeof e.preventDefault === "function") {
                e.preventDefault();
            }
        },
        [langIndex, onCancel, onEnter, text, updateText, msgBox]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [text, onEnter, handleKeyDown]);

    useEffect(() => {
        setText(initText);
    }, [initText]);

    return (
        <div id="AKeyboard" style={style}>
            {keyRows.map((row, index) => (
                <div className="KeysRow" key={index}>
                    {row.map((key, index) => (
                        <span
                            key={index}
                            className={
                                "KeyButton " +
                                key +
                                (typedChar === key ? " typed" : "")
                            }
                            onClick={(_e) => {
                                handleKeyDown({ code: key } as KeyboardEvent);
                            }}
                        >
                            <span className="KeyMainChar">
                                {keyMap[key][langIndex]}
                            </span>
                            <span className="KeyLatinChar">
                                {keyMap[key][secondaryLangIndex]}
                            </span>
                        </span>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default AKeyboard;
