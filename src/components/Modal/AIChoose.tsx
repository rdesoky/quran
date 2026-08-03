import PerplexityLogo from "@/assets/svg/perplexity.svg?react";
import ClaudeLogo from "@/assets/svg/claude.svg?react";
import ChatGptLogo from "@/assets/svg/chatgpt.svg?react";
import { AI_AGENT_URLS } from "@/store/settingsSlice";
import { closePopupIfBlocking } from "@/store/uiSlice";
import { analytics } from "@/services/analytics";
import { FormattedMessage as Message } from "react-intl";
import { useDispatch } from "react-redux";

type AIChooseProps = {
	prompt?: string;
};

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
	default:
		return <ChatGptLogo width={24} height={24} />;
	}
};

const AIChoose = ({ prompt = "" }: AIChooseProps) => {
	const dispatch = useDispatch();

	const onSelect = (agent: string) => {
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
