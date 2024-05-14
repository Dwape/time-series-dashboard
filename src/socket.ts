const url: string = `ws://${process.env.REACT_APP_ADDRESS}:${process.env.REACT_APP_PORT}/ws`

/*
A wrapper for the `WebSocket` class that adds application specific functionality.
*/
export class Socket {
    ws: WebSocket;
    updateSubscribers: Map<number, (update: SeriesUpdate) => void>;
    throughputSubscriber: (timestamp: number) => void;
    onMessage: (event: MessageEvent) => void;

    constructor(
        onConnect: () => void,
        onDisconnect: () => void,
        onSeriesList: (list: SeriesInfoList) => void) {

        this.ws = new WebSocket(url);
        // We need to start the stream for any subscribers who could have registered before the connection was established.
        this.ws.onopen = () => {
            this.updateSubscribers.forEach((_update, key: number) => {
                this.startStream(key);
            });
            onConnect();
        }

        this.ws.onerror = onDisconnect;

        /*
        `onMessage` function which assumes all messages received are updates.
        This avoids checking the type of the message everytime one is received.
        */
        const onFollowingMessages = (event: MessageEvent) => {
            const message = JSON.parse(event.data);
            try {
                this.updateSubscribers.get(message.seriesId)!(message);
                this.throughputSubscriber(message.ts);
            } catch (error) {
                console.log(error);
            }
        }

        // `onMessage` function for the first message, which should contain a list with the different series.
        this.onMessage = (event) => {
            const message = JSON.parse(event.data);
            if (isSeriesList(message)) {
                // Fill the subscriber list with empty functions so that we can always call them, even if there are no real subscribers.
                message.series.forEach((series) => {
                    this.updateSubscribers.set(series.seriesId, () => { });
                })
                this.onMessage = onFollowingMessages;
                onSeriesList(message);
            }
        }

        this.ws.onclose = onDisconnect;
        this.ws.onmessage = (event) => { this.onMessage(event) };

        this.updateSubscribers = new Map<number, (update: SeriesUpdate) => void>();
        this.throughputSubscriber = () => { };
    }

    /*
    Sends a message requesting a list with all available series.
    */
    retrieveSeriesList() {
        if (this.ws.readyState === this.ws.OPEN) {
            this.ws.send(JSON.stringify(listSeriesCommand));
        }
    }

    /*
    Subscribes to updates for a specified `seriesId`.
    A new subscriber will overwrite any previous subscriber for that same id.
    When an update is received for the specified id, the `notify` function will be called.
    */
    subscribeToUpdate(seriesId: number, notify: (update: SeriesUpdate) => void) {
        this.updateSubscribers.set(seriesId, notify);
        if (this.ws.readyState === this.ws.OPEN) {
            this.startStream(seriesId);
        }
    }

    /*
    Unsubscribes from updates from a specified `seriesId`.
    */
    unsubscribeToUpdate(seriesId: number) {
        this.updateSubscribers.set(seriesId, () => { });
        if (this.ws.readyState === this.ws.OPEN) {
            this.stopStream(seriesId);
        }
    }

    /*
    Subscribes to be notified everytime any update is received.
    */
    subscribeToThroughput(notify: (timestamp: number) => void) {
        this.throughputSubscriber = notify;
    }

    /*
    Unsubscribes from notifications for updates.
    */
    unsubscribeToThroughput() {
        this.throughputSubscriber = () => { };
    }

    private startStream(seriesId: number): void {
        const command = { ...startStreamCommand, seriesId: seriesId };
        this.ws.send(JSON.stringify(command));
    }

    private stopStream(seriesId: number): void {
        const command = { ...stopStreamCommand, seriesId: seriesId };
        this.ws.send(JSON.stringify(command));
    }

    close() {
        this.ws.close();
    }
}

export type SeriesInfoList = {
    series: SeriesInfo[]
}

export type SeriesInfo = {
    name: string,
    seriesId: number
}
export type SeriesUpdate = {
    ts: number, // timestamp
    seriesId: number,
    value: number
}

function isSeriesList(message: any): message is SeriesInfoList {
    return 'series' in message;
}

const listSeriesCommand = {
    command: 'listSeries'
}

const startStreamCommand = {
    start: true,
    seriesId: null
}

const stopStreamCommand = {
    start: false,
    seriesId: null
}

