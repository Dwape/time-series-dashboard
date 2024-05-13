import './styles.css'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useState, useRef, useEffect } from 'react';
import { Socket, SeriesInfo, SeriesInfoList } from './socket'
import TimeSeries from './TimeSeries';
import ThroughputIndicator from './ThroughputIndicator';
import { FaCircle, FaChartLine } from "react-icons/fa";

/*
An application that connects to a WebSocket server and handles real-time stock-price updates.
*/
export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [seriesList, setSeriesList] = useState<SeriesInfo[]>([]);

  const ws = useRef<Socket | null>(null);

  // Runs once, when the component is mounted.
  useEffect(() => {

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onSeriesList(data: SeriesInfoList) {
      setSeriesList(data.series);
    }

    // Create a new `Socket` object which connects to a web socket.
    const socket = new Socket(onConnect, onDisconnect, onSeriesList);

    // Store a reference to the `Socket`.
    ws.current = socket;

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    // Once connected, retrieve the existing series in the system.
    if (isConnected && ws.current !== null) ws.current.retrieveSeriesList();

    return () => { };
  }, [isConnected]);

  return (<>
    <Navbar sticky="top" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="">
          <FaChartLine className="logo" />{' '}
          TimeSeries Dashboard
        </Navbar.Brand>
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            <ConnectionIndicator connected={isConnected} />
          </Navbar.Text>
          <Navbar.Text>
            <ThroughputIndicator messageAmount={50} socket={ws.current}></ThroughputIndicator>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    {seriesList.map((series: SeriesInfo) => {
      return (
        <div key={series.seriesId}>
          <TimeSeries seriesId={series.seriesId} seriesName={series.name} socket={ws.current} startActive={false}></TimeSeries>
        </div>
      )
    })}
  </>);
}

/*
A simple indicator component with two states, connected or disconnected.
Displays an icon with a different color for each state.
*/
function ConnectionIndicator({ connected }: { connected: boolean }) {
  return (<FaCircle className={'connection' + (connected ? ' connected' : ' disconnected')} />);
}
