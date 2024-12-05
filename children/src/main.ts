function log(event: any) {
    console.log(event);
    const date = new Date().toLocaleTimeString();
    const textarea = document.querySelector<HTMLTextAreaElement>("#log")!;
    textarea.value += `\n[${date}] ${JSON.stringify(event.data)}`;
}

window.addEventListener(
    "message",
    (event) => {
        if (event.data.source?.startsWith("react-devtools")) {
            return;
        }

        log(event);

        const handler = messageHandlers[event.data.type];
        if (handler) {
            handler(event.data, event);
        }
    },
    false
);

const parentOrigin = import.meta.env.VITE_PARENT_ORIGIN as string;

const messageHandlers: Record<
    string,
    (data: any, event: MessageEvent) => void
> = {
    sendDataToChild: (data, _event) => {
        document.querySelector<HTMLInputElement>("#token")!.value =
            data.payload.token;
    },
};

window.addEventListener("load", () => {
    window.opener.postMessage({ type: "childReady" }, parentOrigin);
});

document
    .querySelector<HTMLButtonElement>("#sendMessage")!
    .addEventListener("click", () => {
        window.opener.postMessage(
            {
                type: "message",
                payload:
                    document.querySelector<HTMLInputElement>("#message")!.value,
            },
            parentOrigin
        );
    });
