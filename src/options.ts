/*
An object containing the options for the time series graphs.
*/
export const chartOptions = {
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
            beginAtZero: true, // This makes the graph readable when values are rapidly updating.
            min: 0
        },
        x: {
            grid: {
                display: false
            },
            ticks: {
                sampleSize: 1 // Uses one sample to figure out the size of the x axis (size is constant for all timestamps)
            }
        },
    },
    animation: {
        duration: 0 // Remove animations.
    },
    elements: {
        point: {
            radius: 0
        }
    },
    parsingOptions: {
        parsing: false, // Avoid parsing as data is already parsed into the format required by the chart.
        normalized: true // Date is already normalized.
    },
    spanGaps: true,
    // events: [], // Remove hover listener
};

const envSize: number = Number(process.env.REACT_APP_DATA_SIZE);
export const dataSize: number = isNaN(envSize) ? 60 : envSize;