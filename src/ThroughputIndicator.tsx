import { useState, useEffect } from 'react';
import { Socket } from './socket'

/*
A component which displays the messages per milliseconds of the last `messageAmount` messages.
Note that this value is not zero when no messages are being received, as it is the throughput for the last `messageAmount` messages,
regardless of when they were received.
*/
export default function ThroughputIndicator({ messageAmount, socket }: { messageAmount: number, socket: Socket | null }) {
    const [timestamps, setTimestamps] = useState<number[]>([]);

    // Executes whenever there is a change to the socket prop.
    useEffect(() => {

        if (socket !== null) socket.subscribeToThroughput(handleMessage);

        return () => {
            socket?.unsubscribeToThroughput();
        };
    }, [socket]);

    const throughput = calculateThroughput();

    /*
    Receives the timestamp of the received message and stores it in state to be used to calculate throughput.
    */
    function handleMessage(timestamp: number) {
        setTimestamps((ts) => {
            if (ts.length < messageAmount) return [...ts, timestamp];
            return [...(ts.slice(ts.length - messageAmount + 1)), timestamp];
        })
    }

    /*
    Calculates the throughput for the last `messageAmount` messages.
    The `timestamps` array is of length n, which before being filled might be smaller than `messageAmount`.
    We need the difference between the most recent timestamp and the oldest one stored,
    which correspond to the last index in `timestamps` and index 0 in `timestamps`, respectively.
    This difference, or time delta, is in nanoseconds, so we divide it by 1,000,000 to obtain its value in milliseconds.
    To calculate the throughput, divide n by the previously calculated difference.
    */
    function calculateThroughput(): number {
        const messagesReceived = timestamps.length;
        if (messagesReceived < 2) return 0;
        const millisecondDelta = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000000;
        return messagesReceived / millisecondDelta;
    }

    return (
        <div className="throughput">{throughput.toFixed(2)} {throughputUnit}</div>
    );
}

const throughputUnit: string = 'messages/millisecond';