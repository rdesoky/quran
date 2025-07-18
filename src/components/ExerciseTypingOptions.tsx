import { useContext, useState } from "react";
import { FormattedMessage as String } from "react-intl";
import { AppRefs } from "@/RefsProvider";

type ExerciseTypingOptionsProps = {
    setQuickMode: (mode: number) => void;
    quickMode: number;
};

export default function ExerciseTypingOptions({
    setQuickMode,
    quickMode,
}: ExerciseTypingOptionsProps) {
    const [option, setOption] = useState(quickMode);
    const msgBox = useContext(AppRefs).get("msgBox");

    const onUpdateQuickMode = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOption(Number(e.target.value));
        setQuickMode(Number(e.target.value));
    };

    const onClose = () => {
        msgBox.pop();
    };

    return (
        <>
            <div className="RadioGroup">
                <div>
                    <label>
                        <input
                            type="radio"
                            name="quickMode"
                            value={0}
                            checked={option === 0}
                            onChange={onUpdateQuickMode}
                        />
                        <span>
                            <String id="quick_mode_0" />
                        </span>
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            type="radio"
                            name="quickMode"
                            value={1}
                            checked={option === 1}
                            onChange={onUpdateQuickMode}
                        />
                        <span>
                            <String id="quick_mode_1" />
                        </span>
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            type="radio"
                            name="quickMode"
                            value={2}
                            checked={option === 2}
                            onChange={onUpdateQuickMode}
                        />
                        <span>
                            <String id="quick_mode_2" />
                        </span>
                    </label>
                </div>
            </div>
            <div className="ButtonsBar">
                <button onClick={onClose}>
                    <String id="ok" />
                </button>
            </div>
        </>
    );
}
