import { useState, useEffect, useMemo } from 'react';
import { Socket, SeriesUpdate } from './socket'
import Button from 'react-bootstrap/Button';
import { Line } from 'react-chartjs-2';
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

// What is this for?
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// Try to find a way to ensure socket is not null so we don't have to add the checks everywhere.
export default function TimeSeries( { seriesId, seriesName, socket }: { seriesId: number, seriesName: string, socket: Socket | null} ) {
    // Data is saved in a convenient format for display, so that it won't have to be calculated every render.
    const [data, setData] = useState<ChartData>({times: [], values: []});
    const [active, setActive] = useState(false);
  
    useEffect(() => {
      
      if (socket !== null) {
        socket.subscribeToUpdate(seriesId, onSeriesUpdate);
        setActive(true); 
      }
  
      return () => {
        if (socket !== null) socket.unsubscribeToUpdate(seriesId);
      };
    }, []); // We could add seriesId to redraw if the seriesId is changed.

    function onSeriesUpdate(update: SeriesUpdate) {
     // Parse time to correct format
     const time = parseTime(update.ts);
      setData(({times, values} : {times: string[], values: number[]}) => {
        const newTimes = (times.length < dataSize) ? [...times, time] : [...(times.slice(times.length - dataSize + 1)), time];
        const newValues = (values.length < dataSize) ? [...values, update.value] : [...(values.slice(values.length - dataSize + 1)), update.value];
        return {times: newTimes, values: newValues};
      })
    }

    /*
    Parses a timestamp in nanoseconds into a time string.
    */
    function parseTime(ts: number): string {
        const date = new Date(ts / 1000000); // Divide by 1,000,000 because it's in nanoseconds.
        const millis = (date.getMilliseconds()).toLocaleString([], {minimumIntegerDigits: 3, useGrouping:false}) // Append zeros if necessary
        return `${date.toLocaleTimeString([], { hour12: false })}.${millis}`;
    }

    // This is the structure of the data for the chart.
    // We should make the x axis start at 0, because otherwise the graph moves around too much
    
    const parsedData = {
        labels: data.times,
        datasets: [
            {
                label: 'price',
                data: data.values,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0
            }
        ]
    }

    /*
    Toggles between receiving and not receiving information for a series.
    */
    function handleToggle() {
        if (socket !== null) {
            if (active) socket.unsubscribeToUpdate(seriesId);
            else socket.subscribeToUpdate(seriesId, onSeriesUpdate);
            setActive(a => !a);
        }
    }
  
    return (
      <div>
        <h4>{seriesName}</h4>
        <h6>{(data.values.length > 0) ? data.values[data.values.length - 1] : ''}</h6>
        <h6>Length: {data.times.length}</h6>
        <Button onClick={handleToggle}>{active? 'Pause' : 'Play'}</Button>
        <Line options={options} data={parsedData} />
      </div>
    );
}

// Default value is 60
const dataSize = 1000; // This is too low, it is difficult to understand how the values are evolving.

type ChartData = {
    times: string[],
    values: number[]
}

// Move to another file
export const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
        text: 'Chart.js Line Chart',
      },
    },
    scales: {
        y: {
            beginAtZero: true
        },
        x: {
            grid: {
              display: false
            }
        },
    },
    animation: {
        duration: 0
    },
    elements: {
        point:{
            radius: 0
        }
    }
};