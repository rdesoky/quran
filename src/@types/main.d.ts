type Msg = {
    type: "info" | "error" | "warning" | "success";
    title?: string;
    content: string;
    key?: number;
    onClose?: () => void;
};
