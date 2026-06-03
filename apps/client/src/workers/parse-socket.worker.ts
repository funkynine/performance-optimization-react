import { ServerMessage, Tick } from "@prep/types";

onmessage = (event: MessageEvent) => {
    const msg = JSON.parse(event.data as string) as ServerMessage;

    if (msg.type === 'snapshot') {
        const initial = new Map<string, Tick>();
        msg.data.forEach((tick) => initial.set(tick.symbol, tick));
        postMessage(initial);
    }
}