// Move to another file
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