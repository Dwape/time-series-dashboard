# TimeSeries Dashboard

A single-page application Dashboard that connects to a WebSocket server and handles real-time stock-price updates.

## Running

`npm start` Starts the React application with the default configuration.

In the default configuration, only 60 data points are graphed at once, which makes reading the graph challenging. In order to change the number of data points drawn, an environment variable can be used. For example, if we wanted to draw 1000 data points at once:

### Linux, macOS (Bash)

`REACT_APP_DATA_SIZE=1000 npm start`

### Windows (cmd.exe)

`set "REACT_APP_DATA_SIZE=1000" && npm start`

### Windows (Powershell)

`($env:REACT_APP_DATA_SIZE = "1000") -and (npm start)`