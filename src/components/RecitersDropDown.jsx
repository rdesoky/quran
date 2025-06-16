import { FormattedMessage as Message } from "react-intl";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ListReciters } from "@/services/audioData";
import { changeReciter, selectReciter } from "@/store/settingsSlice";

export default function RecitersDropDown() {
    const reciter = useSelector(selectReciter);
    const [reciters] = useState(() => ListReciters("ayaAudio"));
    const dispatch = useDispatch();

    function onSelectReciter(e) {
        dispatch(changeReciter(e.target.value));
    }

    return (
        <select
            value={reciter}
            onChange={onSelectReciter}
            style={{
                flexGrow: 1,
                fontSize: 16,
                padding: 4,
            }}
        >
            {reciters.map((r) => (
                <option value={r} key={r}>
                    <Message id={"r." + r} />
                </option>
            ))}
        </select>
    );
}
