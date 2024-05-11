// This file handles web socket connection logic.

// It would make sense to specify the structure of the data sent using the web socket

const url: string = 'ws://35.199.81.113:3000/ws';

// export const socket = new WebSocket(url);

// We should find a better way to do this, so that we decide when the connection is established.
// Maybe we could create out own object which can handle the logic for us.
/*
export const socket = {
    connect: () => {return new WebSocket(url)}
}
*/

// This might be a way to create our own socket that can handle the logic we require

export class Socket {
    ws: WebSocket;

    // What should be the type of the event received?
    constructor(
        onConnect: () => void,
        onDisconnect: () => void,
        onSeriesList: (list: SeriesInfoList) => void,
        onSeriesUpdate: (update: SeriesUpdate[]) => void) {
            
        this.ws = new WebSocket(url);
        this.ws.onopen = onConnect;
        this.ws.onclose = onDisconnect;
        // Should we do something if we have a web socket error?
        this.ws.onmessage = (event) => {
            // we need to parse this data into the values we'll return.
            // What is the best way to do that?
            // event.data
            const message = JSON.parse(event.data);
            // We need to check what structure this object has to see what to do.
            
            // This is less than ideal, find a better way of doing this.
            if (Object.hasOwn(message, 'series')) {
                onSeriesList(message); // This could fail, we have to find a better way.
            } else onSeriesUpdate(message);
        }
    }

    retrieveSeriesList() {
        this.ws.send('{"command": "listSeries"}');
    }

    startStream(seriesId: number): void {
        this.ws.send(`{"start": true, "seriesId": ${seriesId}}`);
    }

    stopStream(seriesId: number): void {
        this.ws.send(`{"start": false, "seriesId": ${seriesId}}`);
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

