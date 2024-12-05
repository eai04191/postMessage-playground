function log(event: any) {
    console.log(event);
    const date = new Date().toLocaleTimeString();
    const textarea = document.querySelector<HTMLTextAreaElement>("#log")!;
    textarea.value += `\n[${date}] ${JSON.stringify(event.data)}`;
}

const childrenUrl = import.meta.env.VITE_CHILDREN_URL as string;
let children: Window | null = null;

document
    .querySelector<HTMLButtonElement>("#open")!
    .addEventListener("click", () => {
        children = window.open(childrenUrl, "child");
    });

window.addEventListener("message", (event) => {
    if (event.data.source?.startsWith("react-devtools")) {
        return;
    }

    log(event);

    const handler = messageHandlers[(event.data.type as string) || ""];
    if (handler) {
        handler(event.data.data, event);
    }
});

const messageHandlers: Record<
    string,
    (data: any, event: MessageEvent) => void
> = {
    childReady: (_data, event) => {
        event.source?.postMessage(
            {
                type: "sendDataToChild",
                payload: {
                    token: document.querySelector<HTMLInputElement>("#token")!
                        .value,
                },
            },
            { targetOrigin: event.origin },
        );
    },
};

document
    .querySelector<HTMLButtonElement>("#sendMessage")!
    .addEventListener("click", () => {
        if (!children) {
            throw new Error("Children window is not open");
        }
        if (children?.closed) {
            throw new Error("Children window is closed");
        }

        children?.postMessage(
            {
                type: "message",
                payload:
                    document.querySelector<HTMLInputElement>("#message")!.value,
            },
            childrenUrl,
        );
    });
``;
