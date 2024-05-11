import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useState, useRef, useEffect } from 'react';
import { Socket, SeriesInfo, SeriesInfoList, SeriesUpdate } from './socket'
// import { socket } from './socket';

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

    function onSeriesUpdate(data: SeriesUpdate[]) {
      // This should most likely be handled by child components
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
    <ul>
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

function ThroughputIndicator( { throughput }: { throughput: number}) { // What type should throughput have?
  const throughputUnit: string = 'messages/millisecond'; // This could be passed as a prop
  return (<h6>{throughput} {throughputUnit}</h6>);
}

// This could be split into several components later on
// It should probably be moved to another file.

// Try to find a way to ensure socket is not null so we don't have to add the checks everywhere.
function TimeSeries( { seriesId, seriesName, socket }: { seriesId: number, seriesName: string, socket: Socket | null} ) {
  const [updates, setUpdates] = useState<SeriesUpdate[]>([]);
  const [active, setActive] = useState(false);

  useEffect(() => {

    /*
    Starts receiving information from the specified series.
    */
    function handleStart(seriesId: number) {
      if (!active && socket !== null) {
        socket.subscribeToUpdate(seriesId, onSeriesUpdate);
        setActive(true);
      }
    }

    /*
    Stops receiving information from the specified series.
    */
    function handleStop(seriesId: number) {
      if (active && socket !== null) {
        socket.unsubscribeToUpdate(seriesId);
        setActive(false);
      }
    }

    function onSeriesUpdate(update: SeriesUpdate) {
      // This should most likely be handled by child components
      // To test, we'll only keep a single value.
      // Change to keep a custom quantity of values.
      setUpdates([update]);
    }

    // Where should the seriesId be stored? Is it fine for it to be a prop
    
    handleStart(seriesId); // The component would start subscribed.

    return () => {
      if (socket !== null) socket.unsubscribeToUpdate(seriesId);
    };
  }, []); // We could add seriesId to redraw if the seriesId is changed.

  return (
    <div>
      <h4>{seriesName}</h4>
      <h6>{(updates.length > 0) ? updates[0].value : ''}</h6>
    </div>
  );
}
