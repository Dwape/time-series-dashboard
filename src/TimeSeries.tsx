import { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { Socket, SeriesUpdate } from './socket'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { Line } from 'react-chartjs-2';
import { chartOptions } from './options';
import { FaPlay, FaPause } from "react-icons/fa";
import { dataSize } from './options';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

/*
A component which displays a chart with updating values and its associated information.
*/
export default function TimeSeries({ seriesId, seriesName, socket, startActive }: { seriesId: number, seriesName: string, socket: Socket | null, startActive: boolean }) {
    // Data is saved in a convenient, normalized format for display, so that it won't have to be calculated every render.
    const [data, setData] = useState<DataPoint[]>([]);
    const [active, setActive] = useState(false);
    const average = useMemo(() => calculateAverage(data), [data]);

    useEffect(() => {
        // Subscribes to updates on mount.
        if (startActive && socket !== null) {
            socket.subscribeToUpdate(seriesId, onSeriesUpdate);
            setActive(true);
        }

        return () => {
            if (socket !== null) socket.unsubscribeToUpdate(seriesId);
        };
    }, [socket]);

    /*
    Updates chart data.
    The data stored in the state is already in the format used by the chart, meaning no additional parsing is required.
    */
    function onSeriesUpdate(update: SeriesUpdate) {
        // Parse time to correct format.
        const time = parseTime(update.ts);
        setData((data: DataPoint[]) => {
            if (data.length < dataSize) return [...data, { x: time, y: update.value }];
            return [...data.slice(data.length - dataSize + 1), { x: time, y: update.value }];
        })
    }

    /*
    Parses a timestamp in nanoseconds into a time string.
    */
    function parseTime(ts: number): string {
        const date = new Date(ts / 1000000); // Divide by 1,000,000 because it's in nanoseconds.
        const millis = (date.getMilliseconds()).toLocaleString([], { minimumIntegerDigits: 3, useGrouping: false }) // Append zeros if necessary
        return `${date.toLocaleTimeString([], { hour12: false })}.${millis}`;
    }

    /*
    Calculate the average of graphed values avoiding an overflow if values are close to the maximum allowed value.
    */
    function calculateAverage(data: DataPoint[]) {
        /*
        if (data.values.length < 1) return 0;
        return data.values.reduce((a, b) => a + b, 0) / data.values.length;
        */
        let average = 0;
        data.forEach((dataPoint, index) => {
            average += (dataPoint.y - average) / (index + 1);
        })
        return average;
    }

    // Data structured as the chart requires.
    const parsedData = {
        datasets: [{
            data: data,
            fill: false,
            borderColor: 'rgb(47, 193, 34)',
        }]
    }

    /*
    Toggles between receiving and not receiving information for a series.
    */
    const handleToggle = useCallback(() => {
        if (socket !== null) {
            if (active) socket.unsubscribeToUpdate(seriesId);
            else socket.subscribeToUpdate(seriesId, onSeriesUpdate);
            setActive(a => !a);
        }
    }, [socket, active]);

    return (
        <Card className="time-series">
            <Card.Body>
                <div className="chart-header">
                    <h3 className="series-title">{seriesName}</h3>
                    <span className="average">Average: ${average.toLocaleString([], { maximumFractionDigits: 3 })}</span>
                    <PlayButton onClick={handleToggle} active={active}></PlayButton>
                </div>
                <Line options={chartOptions} data={parsedData} />
            </Card.Body>
        </Card>
    );
}

/*
A component which consists of a button which can be used to start or stop data streaming.
*/
const PlayButton = memo(function PlayButton({ active, onClick }: { active: boolean, onClick: () => void }) {
    return (
        <Button onClick={onClick} className="chart-button" variant="dark">
            {active ? <FaPause className="button-icon" /> : <FaPlay className="button-icon" />}
        </Button>
    );
})

type DataPoint = {
    x: string,
    y: number
}