import { useEffect, useState } from "react";
import { FormattedMessage as Message } from "react-intl";
import { useSelector } from "react-redux";
import { analytics } from "@/services/analytics";
import { selectBookmarks } from "@/store/dbSlice";
import { BookmarkListItem } from "./BookmarkListItem";

type BookmarksListProps = {
    filter?: string;
    trigger?: string;
};

export const BookmarksList = ({
    filter,
    trigger = "bookmarks_index",
}: BookmarksListProps) => {
    const [actionsIndex, setActionsIndex] = useState(-1);
    const [showTafseer, setShowTafseer] = useState(false);
    const bookmarks = useSelector(selectBookmarks);

    const handleShowTafseerChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setShowTafseer(e.currentTarget.checked);
    };

    useEffect(() => {
        analytics.setTrigger(trigger);
    }, [trigger]);

    if (!bookmarks.length) {
        return (
            <div>
                <Message id="no_bookmarks" />
            </div>
        );
    }
    return (
        <>
            <div className="InputRow">
                <input
                    type="checkbox"
                    onChange={handleShowTafseerChange}
                    checked={showTafseer}
                    id="toggleTafseer"
                />
                <label htmlFor="toggleTafseer">
                    <Message id="tafseer" />
                </label>
            </div>
            <ul className="FlowingList">
                {bookmarks.map((bookmark) => {
                    const verse = parseInt(bookmark.aya);
                    return (
                        <BookmarkListItem
                            key={verse}
                            verse={verse}
                            filter={filter}
                            selectedVerse={actionsIndex}
                            selectVerse={setActionsIndex}
                            showTafseer={showTafseer}
                            trigger={trigger}
                        />
                    );
                })}
            </ul>
        </>
    );
};
