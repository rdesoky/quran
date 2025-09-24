import { FormattedMessage as Message, useIntl } from "react-intl";

import { useMessageBox } from "@/RefsProvider";
import {
	commandKey,
	keyValues
} from "@/services/utils";
import {
	selectUser
} from "@/store/dbSlice";
import {
	selectUpdateAvailable,
	setUpdateAvailable
} from "@/store/uiSlice";
import { useDispatch, useSelector } from "react-redux";

import { CommandIcon, CommandType } from "@/components/CommandIcon";
import UpdateBadge from "@/components/UpdateBadge";
import useCommands from "@/hooks/useCommands";

type CommandButtonProps = {
	id?: string;
	command: CommandType;
	showLabel?: boolean;
	showHotKey?: boolean;
	style?: React.CSSProperties;
	className?: string;
	trigger?: string;
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
	updateChecker?: boolean; // if true, will check for updates and show a badge if
};

export const CommandButton = ({
	id,
	command,
	showLabel,
	showHotKey = true,
	style,
	className,
	trigger,
	onClick,
	updateChecker = false,
}: CommandButtonProps) => {
	const msgBox = useMessageBox();
	const dispatch = useDispatch();
	const intl = useIntl();
	const user = useSelector(selectUser);
	const updateAvailable = useSelector(selectUpdateAvailable);
	const { runCommand } = useCommands();


	const renderLabel = () => {
		if (showLabel === true) {
			let label: React.ReactNode | string = (
				<Message
					id={command.toLowerCase()}
					values={showHotKey ? keyValues(commandKey(command)) : {}}
				/>
			);
			switch (command) {
			case "Profile":
				if (user && !user.isAnonymous) {
					label = user.displayName + " (u)";
				}
				break;
			default:
				break;
			}
			return <span className="CommandLabel">{label}</span>;
		}
	};

	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		if (updateChecker && updateAvailable) {
			dispatch(setUpdateAvailable(false));
			msgBox?.push({
				title: <Message id="update_available_title" />,
				content: <Message id="update_available" />,
				onYes: () => {
					document.location.reload();
				},
			});
			e.stopPropagation();
			return;
		}
		if (onClick) {
			onClick(e);
		} else {
			runCommand(command, trigger);
		}
		switch (command) {
		case "Commands":
		case "Stop":
			e.stopPropagation();
			break;
		default:
			break;
		}
	};

	return (
		<button
			id={id}
			onClick={handleClick}
			style={style}
			className={"CommandButton".appendWord(className)}
			title={
				showLabel
					? ""
					: intl.formatMessage(
						{
							id: command.toLowerCase(),
						},
						keyValues(commandKey(command))
					)
			}
		>
			{updateChecker && updateAvailable && <UpdateBadge />}
			<CommandIcon {...{ command }} />
			{renderLabel()}
		</button>
	);
};
