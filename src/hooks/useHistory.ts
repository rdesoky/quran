import { useNavigate } from "react-router";

export type HistoryType = {
    push: (path: string) => void;
    replace: (path: string) => void;
    goBack: () => void;
    goForward: () => void;
    go: (n: number) => void;
};

export const useHistory = () => {
    const navigate = useNavigate();

    return {
        push: (path: string) => navigate(path),
        replace: (path: string) => navigate(path, { replace: true }),
        goBack: () => navigate(-1),
        goForward: () => navigate(1),
        go: (n: number) => navigate(n),
    } as HistoryType;
};
