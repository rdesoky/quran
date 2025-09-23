import { AppRefs } from "@/RefsProvider";
import { TestMode } from "@/components/types";
import { saveTestMode, selectTestMode } from "@/store/settingsSlice";
import { useContext } from "react";
import { FormattedMessage as String } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

type ExerciseTypingOptionsProps = {
	modal?: boolean;
};

export default function ExerciseTypingOptions({
	modal = true,
}: ExerciseTypingOptionsProps) {
	// const [option, setOption] = useState(testMode);
	const msgBox = useContext(AppRefs).get("msgBox");
	const dispatch = useDispatch();
	const testMode = useSelector(selectTestMode);

	const onUpdateTestMode = (e: React.ChangeEvent<HTMLInputElement>) => {
		dispatch(saveTestMode(Number(e.target.value) as TestMode));
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
							value={TestMode.reviewOnFinish}
							checked={testMode === TestMode.reviewOnFinish}
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
							value={TestMode.nextOnFinish}
							checked={testMode === TestMode.nextOnFinish}
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
							value={TestMode.nextOnPartialFinish}
							checked={testMode === TestMode.nextOnPartialFinish}
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
