import PerplexityLogo from "@/assets/svg/perplexity.svg?react";
import ClaudeLogo from "@/assets/svg/claude.svg?react";
import ChatGptLogo from "@/assets/svg/chatgpt.svg?react";
import MetaLogo from "@/assets/svg/metaai.svg?react";
import GoogleLogo from "@/assets/svg/google.svg?react";
import { AI_AGENT_URLS } from "@/store/settingsSlice";
import { closePopupIfBlocking } from "@/store/uiSlice";
import { analytics } from "@/services/analytics";
import { buildAIPrompt } from "@/services/utils";
import { selectSelectedText, selectStartSelection } from "@/store/navSlice";
import { FormattedMessage as Message, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

type AgentLogoProps = {
	agent: string;
};

const AgentLogo = ({ agent }: AgentLogoProps) => {
	switch (agent) {
		case "Perplexity":
			return <PerplexityLogo width={24} height={24} />;
		case "Claude":
			return <ClaudeLogo width={24} height={24} />;
		case "ChatGPT":
			return <ChatGptLogo width={24} height={24} />;
		case "Google":
			return <GoogleLogo width={24} height={24} />;
		case "Meta":
			return <MetaLogo width={24} height={24} />;
		default:
			return <ChatGptLogo width={24} height={24} />;
	}
};

const AIChoose = () => {
	const dispatch = useDispatch();
	const intl = useIntl();
	const selectStart = useSelector(selectStartSelection);
	const selectedText = useSelector(selectSelectedText);

	const onSelect = (agent: string) => {
		const prompt = buildAIPrompt(intl, selectedText, selectStart);
		const baseUrl = AI_AGENT_URLS[agent] || AI_AGENT_URLS.ChatGPT;
		const url = `${baseUrl}${encodeURIComponent(prompt)}`;
		window.open(url, "_blank");
		analytics.logEvent("researchwithai", { agent });
		dispatch(closePopupIfBlocking());
	};

	return (
		<>
			<div className="Title">
				<Message id="choose_ai_agent" />
			</div>
			<div className="PopupBody">
				<div className="CommandsList">
					{Object.keys(AI_AGENT_URLS).map((agent) => (
						<button
							key={agent}
							onClick={() => onSelect(agent)}
						>
							<AgentLogo agent={agent} />
							{agent}
						</button>
					))}
				</div>
			</div>
		</>
	);
};

export default AIChoose;
