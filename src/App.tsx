import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useState, useRef, useEffect } from 'react';
import { Socket, SeriesInfo, SeriesInfoList, SeriesUpdate } from './socket'
// import { socket } from './socket';

export default function App() {
  const [isConnected, setIsConnected] = useState(false); // Can we check if we are connected in the socket?
  // We should store both the series details and the latest updates.
  const [seriesEvents, setSeriesEvents] = useState([]); // Might be good to change the name.

  // We need to be careful with the types here.
  const ws = useRef(null as any); // This might not be ideal, but we should have a reference to the socket in different places.

  // Runs once, when the component is mounted.
  useEffect(() => {

    // socket.connect(); // Does this work? We would have to store the socket somewhere, we need to think how to make this work.

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    // How many values should we keep?
    function onSeriesList(data: SeriesInfoList) {
      // Add the logic for updating the events.
      // setSeriesEvents(previous => [...previous, value]); // Fix this.
    }

    function onSeriesUpdate(data: SeriesUpdate[]) {

    }

    const socket = new Socket(onConnect, onDisconnect, onSeriesList, onSeriesUpdate);

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    // Once we've connected, we should retrieve the existing series in the system. (Find out how to do this)
    // Should we update this? How would we know when to update?
    if (isConnected) ws.current.retrieveSeriesList(); // This could be improved.

    return () => {}; // What should we return if we have to do nothing?
  }, [isConnected]);

  /*
  Starts receiving information from the specified series.
  */
  function handleStart(seriesId: number) {

  }

  /*
  Stops receiving information from the specified series.
  */
  function handleStop(seriesId: number) {

  }

  return (<>
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="">TimeSeries Dashboard</Navbar.Brand>
        <Nav className="me-auto">
            <Navbar.Text>
              <ConnectionIndicator connected={isConnected}/>
            </Navbar.Text>
            <Navbar.Text>
              <ThroughputIndicator throughput={10.34}></ThroughputIndicator>
            </Navbar.Text>
          </Nav>
      </Container>
    </Navbar>
  </>);
}

function ConnectionIndicator( { connected }: { connected: boolean } ) {
  return (<h6>{connected ? '🟢' : '🔴'}</h6>); // We could add icons to make this look a bit nicer.
}

function ThroughputIndicator( { throughput }: { throughput: number}) { // What type should throughput have?
  const throughputUnit: string = 'messages/millisecond'; // This could be passed as a prop
  return (<h6>{throughput} {throughputUnit}</h6>);
}
