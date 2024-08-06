import React from 'react';
import Simulation from './Simulation';
import Alerts from './Alerts';

function App() {
  const userEmail = 'jason.hatfield@lowes.com';

  return (
    <div className="App">
      <h1>Lowes Parking App</h1>
      <Simulation />
      <Alerts userEmail={userEmail} />
    </div>
  );
}

export default App;
