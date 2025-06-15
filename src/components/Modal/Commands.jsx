import React from "react";
import { FormattedMessage as String } from "react-intl";

import { useSelector } from "react-redux";
import { selectIsNarrow } from "../../store/layoutSlice";
import { PlayerButtons } from "../AudioPlayer/PlayerButtons";
import { VerseInfo } from "../Widgets";

import { CommandButton } from "../CommandButton";

const Commands = () => {
    const isNarrow = useSelector(selectIsNarrow);

    const list = [
        "Index",
        "AudioPlayer",
        "Search",
        "Exercise",
        "Tafseer",
        "Mask",
        "Goto",
        "Theme",
        "Bookmarks",
        "Copy",
        "Share",
        "update_hifz",
        "Profile",
        "Settings",
        "Help",
        // "Fullscreen",
    ];

    return (
        <>
            <div className="Title">
                {isNarrow ? (
                    <>
                        <VerseInfo trigger="commands_title" />
                        <PlayerButtons
                            trigger="commands_title"
                            showReciter={false}
                        />
                    </>
                ) : (
                    <String id="commands" />
                )}
            </div>
            <div className="CommandsList">
                {list.map((command) => (
                    <CommandButton
                        key={command}
                        command={command}
                        showLabel={true}
                    />
                ))}
            </div>
        </>
    );
};

export default Commands;
