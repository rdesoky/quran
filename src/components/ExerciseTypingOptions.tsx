import { useContext, useState } from "react";
import { FormattedMessage as String } from "react-intl";
import { AppRefs } from "@/RefsProvider";
import { TestMode } from "@/components/types";

type ExerciseTypingOptionsProps = {
	saveTestMode: (mode: TestMode) => void;
	testMode: TestMode;
	modal?: boolean;
};

export default function ExerciseTypingOptions({
	saveTestMode,
	testMode,
	modal = true,
}: ExerciseTypingOptionsProps) {
	const [option, setOption] = useState(testMode);
	const msgBox = useContext(AppRefs).get("msgBox");

	const onUpdateTestMode = (e: React.ChangeEvent<HTMLInputElement>) => {
		setOption(Number(e.target.value) as TestMode);
		saveTestMode(Number(e.target.value) as TestMode);
	};

	const onClose = () => {
		msgBox.pop();
	};

	return (
		<div id="ExerciseTypingOptions">
			{modal ? null : <div>
				<String id="typing_settings" />
			</div>
			}
			<div className="RadioGroup">
				<div>
					<label>
						<input
							type="radio"
							name="quickMode"
							value={0}
							checked={option === 0}
							onChange={onUpdateTestMode}
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
							onChange={onUpdateTestMode}
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
							onChange={onUpdateTestMode}
						/>
						<span>
							<String id="quick_mode_2" />
						</span>
					</label>
				</div>
			</div>
			{modal && <div className="ButtonsBar">
				<button onClick={onClose}>
					<String id="ok" />
				</button>
			</div>}
		</div>
	);
}
