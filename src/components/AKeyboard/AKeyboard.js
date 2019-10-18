import React, { useState, useEffect } from "react";
import "./AKeyboard.scss";

const AKeyboard = ({ initText, onUpdateText, onEnter }) => {
    const [text, setText] = useState(initText);

    const keyMap = {
        //first
        BracketLeft: ["ج"],
        KeyP: ["ح"],
        KeyO: ["خ"],
        KeyI: ["ه"],
        KeyU: ["ع"],
        KeyY: ["غ"],
        KeyT: ["ف"],
        KeyR: ["ق"],
        KeyE: ["ث"],
        KeyW: ["ص"],
        KeyQ: ["ض"],

        //second
        Quote: ["ط"],
        Semicolon: ["ك"],
        KeyL: ["م"],
        KeyK: ["ن"],
        KeyJ: ["ت"],
        KeyH: ["ا"],
        KeyG: ["ل"],
        KeyF: ["ب"],
        KeyD: ["ي"],
        KeyS: ["س"],
        KeyA: ["ش"],

        //Third
        BracketRight: ["د"],
        Slash: ["ظ"],
        Period: ["ز"],
        Comma: ["و"],
        KeyM: ["ة"],
        KeyN: ["ى"],
        KeyB: ["لا"], //skip
        KeyV: ["ر"],
        KeyC: ["ؤ"],
        KeyX: ["ء"],
        KeyZ: ["ئ"], //??

        //Forth
        Backquote: ["ذ"],
        Space: [" "],
        Backspace: ["<-"],
        ClearAll: ["x^"],
        ClearWord: ["<-^"]
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
        ["Backspace", "ClearAll", "ClearWord", "Space", "Backquote"]
    ];

    const updateText = newText => {
        setText(newText);
        onUpdateText(newText);
    };

    const handleKeyDown = e => {
        const { code, ctrlKey } = e;
        switch (code) {
            case "Enter":
                onEnter(text);
                break;
            case "Backspace":
                if (ctrlKey) {
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

    return (
        <div id="AKeyboard">
            {keyRows.map((row, index) => (
                <div className="KeysRow" key={index}>
                    {row.map((key, index) => (
                        <span
                            key={index}
                            className={"KeyButton " + key}
                            onClick={e => {
                                handleKeyDown({ code: key });
                            }}
                        >
                            {keyMap[key][0]}
                        </span>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default AKeyboard;
