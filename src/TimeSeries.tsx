import { useState, useEffect, useReducer } from 'react';
import { Socket, SeriesUpdate } from './socket'
import Button from 'react-bootstrap/Button';
// This could be split into several components later on
// It should probably be moved to another file.

// Try to find a way to ensure socket is not null so we don't have to add the checks everywhere.
export default function TimeSeries( { seriesId, seriesName, socket }: { seriesId: number, seriesName: string, socket: Socket | null} ) {
    // const [updates, setUpdates] = useState<SeriesUpdate[]>([]);
    const [updates, dispatch] = useReducer(updateReducer, []); // Second argument is initial values.
    const [active, setActive] = useState(false);
  
    useEffect(() => {
  
      // Where should the seriesId be stored? Is it fine for it to be a prop?
      
      // We should activate it in the beginning, right?
      // handleToggle(); // The component would start subscribed.
      // Can't we use handleToggle here as well?
      if (socket !== null) {
        socket.subscribeToUpdate(seriesId, onSeriesUpdate);
        setActive(true); 
      }
  
      return () => {
        if (socket !== null) socket.unsubscribeToUpdate(seriesId);
      };
    }, []); // We could add seriesId to redraw if the seriesId is changed.

    function onSeriesUpdate(update: SeriesUpdate) {
      // console.log(`Update received for ${seriesId}`); // Remove, only for testing.
      // To test, we'll only keep a single value.
      // Change to keep a custom quantity of values.
      // We could use a reducer for this.
      dispatch({
        type: UpdateActionType.ADD,
        update: update
      });
      // setUpdates([update]);
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
        <h6>{(updates.length > 0) ? updates[0].value : ''}</h6>
        <Button onClick={handleToggle}>{active? 'Pause' : 'Play'}</Button>
      </div>
    );
}

function updateReducer(state: SeriesUpdate[], action: UpdateAction): SeriesUpdate[] {
    // return next state for React to set
    switch (action.type) {
        case 'ADD':
            // Update state.
            // We need to display the last 60 values
            // This amount shouldn't be hard coded to make it easier to customize, where should it go?
            return [action.update];
        default:
            return state;
    }
}

interface UpdateAction {
    type: UpdateActionType;
    update: SeriesUpdate;
}

enum UpdateActionType {
    ADD = 'ADD'
}