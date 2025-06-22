import { selectReciter } from "@/store/settingsSlice";
import { FormattedMessage as Message } from "react-intl";
import { useSelector } from "react-redux";

type ReciterNameProps = {
    id?: string;
};

export default function ReciterName({ id }: ReciterNameProps) {
    const activeReciter = useSelector(selectReciter);
    const reciter = id ?? activeReciter;

    return reciter && <Message id={"r." + reciter} />;
}
