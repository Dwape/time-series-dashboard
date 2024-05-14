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

## Features

On start up the app creates a web socket connection to receive updates for the values of the time series. Once the connection is established, the app sends a message requesting a list of all existing time series. Upon receiving this list, the app creates a `TimeSeries` Component for each one.

When the `TimeSeries` component is mounted, it subscribes to receive updates for it assigned time series from `Socket`, a wrapper for `WebSocket` which implements some app specific functionality.

On each update, `Socket` will check which time series it corresponds to and it will send the update to the appropriate subscriber. When the `TimeSeries` receives the update, it stores the value in its state so that it can be displayed in a graph, deleting any old values that should no longer be displayed.

Each `TimeSeries` component allows the user to start and stop the data stream using a button. When starting or stopping the stream, a corresponding message is sent through the web socket to start or to stop receving data for that time series.

### Navbar

A basic navbar which displays:

- **App Name**
- **Connection Indicator:** indicates whether the app is connected to the web socket or not.
- **Throughput Indicator:** shows the average throughput for the last 50 messages. Note that even if no messages are currently being received, the throughput value could be other than zero, as it is the throughput for the last 50 received messages, regardless of when they were received.

### TimeSeries

A component which displays a graph with values received through the web socket connection. One component will be displayed for each time series that exists.

This component contains the following:

- **TimeSeries name**
- **Average Value:** Displays the average value for the data points in the chart.
- **Chart**: Displays the last `DATA_SIZE` data points received.
- **Button**: Allows for starting and stoping the data stream for a specific series.