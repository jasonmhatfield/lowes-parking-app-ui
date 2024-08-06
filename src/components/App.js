import React from 'react';
import Simulation from './Simulation';
import Alerts from './Alerts';

function App() {
  const userEmail = 'jason.hatfield@lowes.com'; // Replace with the actual email of the user you want to test

  return (
    <div className="App">
      <h1>Lowes Parking App</h1>
      <Simulation />
      <Alerts userEmail={userEmail} />
    </div>
  );
}

export default App;
