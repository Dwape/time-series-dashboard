import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useState, useRef, useEffect } from 'react';
import { Socket, SeriesInfo, SeriesInfoList } from './socket'
import TimeSeries from './TimeSeries';
import ThroughputIndicator from './ThroughputIndicator';

export default function App() {
  const [isConnected, setIsConnected] = useState(false); // Can we check if we are connected in the socket?
  // We should store both the series details and the latest updates.
  const [seriesList, setSeriesList] = useState<SeriesInfo[]>([]);

  // We need to be careful with the types here.
  const ws = useRef<Socket | null>(null); // This might not be ideal, but we should have a reference to the socket in different places.

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

    const socket = new Socket(onConnect, onDisconnect, onSeriesList);

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    // Once we've connected, we should retrieve the existing series in the system. (Find out how to do this)
    // Should we update this? How would we know when to update?
    if (isConnected && ws.current !== null) ws.current.retrieveSeriesList(); // This could be improved.

    return () => {}; // What should we return if we have to do nothing?
  }, [isConnected]);

  return (<>
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="">TimeSeries Dashboard</Navbar.Brand>
        <Nav className="me-auto">
            <Navbar.Text>
              <ConnectionIndicator connected={isConnected}/>
            </Navbar.Text>
            <Navbar.Text>
              <ThroughputIndicator messageAmount={50} socket={ws.current}></ThroughputIndicator>
            </Navbar.Text>
          </Nav>
      </Container>
    </Navbar>
    <ul style={{listStyleType: 'none'}}>
      {seriesList.map((series: SeriesInfo) => {
        return (
          <li key={series.seriesId}>
            <TimeSeries seriesId={series.seriesId} seriesName={series.name} socket={ws.current}></TimeSeries>
          </li>
          )
      })}
    </ul>
  </>);
}

function ConnectionIndicator( { connected }: { connected: boolean } ) {
  return (<h6>{connected ? '🟢' : '🔴'}</h6>); // We could add icons to make this look a bit nicer.
}
