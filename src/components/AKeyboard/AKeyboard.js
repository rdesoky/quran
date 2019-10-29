import React, { useState, useEffect } from "react";
import "./AKeyboard.scss";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
    faBackspace,
    faCheckCircle,
    faStepBackward,
    faFastBackward,
    faTimes
} from "@fortawesome/free-solid-svg-icons";

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
    Backspace: [<Icon icon={faBackspace} />, "Bksp"],
    ClearWord: [<Icon icon={faStepBackward} />, "Ctrl+Bksp"],
    ClearAll: [<Icon icon={faFastBackward} />, "Ctrl+x"],
    Enter: [<Icon icon={faCheckCircle} />, "Enter"]
};

const keyRows = [
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
        "KeyQ"
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
        "KeyA"
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
        "KeyZ"
    ],
    ["Enter", "Backspace", "ClearWord", "Space", "ClearAll", "Backquote"]
];

const AKeyboard = ({ initText, onUpdateText, onEnter, onCancel, style }) => {
    const [text, setText] = useState(initText);
    const [typedChar, setTypedChar] = useState("");

    const updateText = newText => {
        setText(newText);
        onUpdateText(newText);
    };

    const handleKeyDown = e => {
        const { code, ctrlKey, target } = e;
        setTypedChar(code);
        // setTimeout(() => {
        //     setTypedChar("");
        // }, 300);
        if (
            code === "Space" &&
            target &&
            target.tagName.match(/input|button/i)
        ) {
            return;
        }

        switch (code) {
            case "Escape":
                onCancel();
                break;
            case "Enter":
                onEnter(text);
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
            default:
                if (keyMap[code]) {
                    updateText(text.concat(keyMap[code][0]));
                }
        }
    };

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [text, onEnter]);

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
                            onClick={e => {
                                handleKeyDown({ code: key });
                            }}
                        >
                            <span className="KeyMainChar">
                                {keyMap[key][0]}
                            </span>
                            <span className="KeyLatinChar">
                                {keyMap[key][1]}
                            </span>
                        </span>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default AKeyboard;
