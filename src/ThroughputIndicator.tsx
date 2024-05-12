import { useState, useEffect } from 'react';
import { Socket } from './socket'

export default function ThroughputIndicator( { messageAmount, socket }: { messageAmount: number, socket: Socket | null}) {
    const [timestamps, setTimestamps] = useState<number[]>([]);
  
    useEffect(() => {
  
      if (socket !== null) socket.subscribeToThroughput(handleMessage);
  
      return () => {
        socket?.unsubscribeToThroughput();
      };
    }, [socket]);

    const throughputUnit: string = 'messages/millisecond'; // How should this be done?
  
    const throughput = calculateThroughput();

    function handleMessage(timestamp: number) {
        setTimestamps((ts) => {
            if (ts.length < messageAmount) return [...ts, timestamp]; // Where should we store the number?
            return [...(ts.slice(ts.length - messageAmount + 1)), timestamp];
        })
    }
  
    // Rewrite explanation
    // Calculate throughput (one millisecond === one million nanoseconds)
    // Take the last 50 messages
    // n / ((last timestamp - first timestamp) / 1,000,000)
    // n should be the length of the array in this case in case it is not yet full.

    // This needs to be fixed
    // This provides the throughput for the last 50 messages, but if messages stop, we'll display the same throughput all the time
    // This could be correct based on the specification, but it doesn't seem to be the desired behavior.
    function calculateThroughput(): number {
        const messagesReceived = timestamps.length;
        if (messagesReceived < 2) return 0;
        const millisecondDelta = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000000;
        return messagesReceived / millisecondDelta;
    }
  
    // Value should be separated from the unit to avoid the unit moving when the display size of the number changes.
    return (
        <div id="throughput">{throughput.toFixed(2)} {throughputUnit}</div>
    );
  }