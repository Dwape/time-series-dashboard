// This file handles web socket connection logic.

const url: string = 'ws://35.199.81.113:3000/ws';

export class Socket {
    ws: WebSocket;
    // Is SeriesUpdate a list or individual updates?
    updateSubscribers: Map<number, (update: SeriesUpdate) => void>;

    // What should be the type of the event received?
    constructor(
        onConnect: () => void,
        onDisconnect: () => void,
        onSeriesList: (list: SeriesInfoList) => void) {

        this.ws = new WebSocket(url);
        // We need to start the stream for any subscribers. (They could be registered before the connection is established)
        this.ws.onopen = () => {
            this.updateSubscribers.forEach((_update, key: number) => {
                this.startStream(key); // Check if this creates any problems.
            });
            onConnect();
        }

        this.ws.onclose = onDisconnect;
        // Should we do something if we have a web socket error?
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            // We need to check what structure this object has to see what to do.
            
            // This is less than ideal, find a better way of doing this.
            // Can we somehow 'cast' the message to an object we know?
            if (Object.hasOwn(message, 'series')) {
                onSeriesList(message); // This could fail, we have to find a better way.
            } else {
                const id = message.seriesId;
                if (this.updateSubscribers.has(id)) {
                    this.updateSubscribers.get(id)!(message); // How do we convince TypeScript this is not undefined?
                }
            }
        }

        this.updateSubscribers = new Map<number, (update: SeriesUpdate) => void>()
    }

    retrieveSeriesList() {
        // this.ws.send('{"command": "listSeries"}');
        this.ws.send(JSON.stringify(listSeriesCommand));
    }

    // We could add the option for several subscribers per seriesId, but that would require more logic.
    // We would need to keep track of the different callback functions to be able to tell which one to delete when unsubscribing.
    subscribeToUpdate(seriesId: number, notify: (update: SeriesUpdate) => void) {
        // This might be problematic if executed twice, test.
        // We could check if there already is a subscriber for that id, but what should we do then?
        this.updateSubscribers.set(seriesId, notify);
        // We could also track ourselves if the connection is open.
        if (this.ws.readyState === this.ws.OPEN) {
            this.startStream(seriesId);
        }
    }

    // We would need extra information to identify the one we are removing if there were many.
    unsubscribeToUpdate(seriesId: number) {
        this.updateSubscribers.delete(seriesId);
        if (this.ws.readyState === this.ws.OPEN) {
            this.stopStream(seriesId);
        }
    }

    // We could change this to not use the strings directly.
    private startStream(seriesId: number): void {
        // this.ws.send(`{"start": true, "seriesId": ${seriesId}}`);
        const command = {...startStreamCommand, seriesId: seriesId};
        this.ws.send(JSON.stringify(command));
    }

    private stopStream(seriesId: number): void {
        // this.ws.send(`{"start": false, "seriesId": ${seriesId}}`);
        const command = {...stopStreamCommand, seriesId: seriesId};
        this.ws.send(JSON.stringify(command));
    }

    close() {
        this.ws.close();
    }
}

export type SeriesInfoList = {
    series: SeriesInfo[]
}

// Somes types that could be useful to manage the data received from the web socket.
export type SeriesInfo = {
    name: string,
    seriesId: number // or just id? What type should this have?
}

// Is it okay for all these to be numbers?
export type SeriesUpdate = {
    ts: number, // timestamp
    seriesId: number,
    value: number
}

const listSeriesCommand = {
    command: 'listSeries'
}

const startStreamCommand = {
    start: true,
    seriesId: null // What should we make this value?
}

const stopStreamCommand = {
    start: false,
    seriesId: null
}

