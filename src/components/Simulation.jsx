import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from '@mui/material/Slider';
import HandicapIcon from '@mui/icons-material/Accessible';
import EvIcon from '@mui/icons-material/EvStation';
import '../styles/Simulation.css';

const Simulation = () => {
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [hourOfDay, setHourOfDay] = useState(7);
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sliderTimeout, setSliderTimeout] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    resetAndLoadSimulation(dayOfWeek, hourOfDay);
  }, []);

  useEffect(() => {
    if (dayOfWeek !== null && hourOfDay !== null) {
      if (sliderTimeout) {
        clearTimeout(sliderTimeout);
      }
      setLoading(true);
      setSliderTimeout(setTimeout(() => {
        updateSimulation(dayOfWeek, hourOfDay);
      }, 2000));
    }
  }, [dayOfWeek, hourOfDay]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const resetAndLoadSimulation = async (day, hour) => {
    try {
      setLoading(true);
      setError(null);
      await axios.post('http://localhost:8080/api/simulation/reset');
      await loadSimulation(day, hour);
    } catch (error) {
      console.error('Error resetting and loading simulation:', error);
      setError('Failed to reset and load simulation.');
      setLoading(false);
    }
  };

  const loadSimulation = async (day, hour) => {
    try {
      const response = await axios.post(`http://localhost:8080/api/simulation/load?dayOfWeek=${day}&hourOfDay=${hour}`);
      setParkingSpaces(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading simulation:', error);
      setError('Failed to load simulation.');
      setLoading(false);
    }
  };

  const updateSimulation = async (day, hour) => {
    try {
      setError(null);
      const response = await axios.post(`http://localhost:8080/api/simulation/load?dayOfWeek=${day}&hourOfDay=${hour}`);
      setParkingSpaces(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error updating simulation:', error);
      setError('Failed to update simulation.');
      setLoading(false);
    }
  };

  const handleSliderChange = (event, newValue) => {
    setHourOfDay(newValue);
    setLoading(true);
  };

  const formatTime = (value) => {
    const hours = value;
    return `${hours}:00`;
  };

  const getPercentageOccupied = () => {
    const occupiedSpaces = parkingSpaces.filter(space => space.occupied).length;
    const totalSpaces = parkingSpaces.length;
    return ((occupiedSpaces / totalSpaces) * 100).toFixed(2);
  };

  const groupSpacesByFloor = (spaces) => {
    return spaces.reduce((acc, space) => {
      if (!acc[space.floor]) {
        acc[space.floor] = [];
      }
      acc[space.floor].push(space);
      return acc;
    }, {});
  };

  const renderParkingSpace = (space) => {
    let className = 'parking-space';
    if (space.type === 'handicap') {
      className += ' handicap';
    } else if (space.type === 'ev') {
      className += ' ev';
    } else if (space.occupied) {
      className += ' occupied';
    }

    return (
      <div key={space.spaceId} className={className}>
        <span className="space-number">{space.spaceNumber}</span>
        {space.type === 'handicap' && <HandicapIcon className="icon" />}
        {space.type === 'ev' && <EvIcon className="icon" />}
      </div>
    );
  };

  const renderFloor = (floorSpaces, floorNumber) => {
    return (
      <div key={floorNumber} className="parking-floor">
        <h4>Floor {floorNumber}</h4>
        <div className="floor-spaces">
          {floorSpaces.map(renderParkingSpace)}
        </div>
      </div>
    );
  };

  const renderParkingStructure = () => {
    const spacesByFloor = groupSpacesByFloor(parkingSpaces);
    return Object.entries(spacesByFloor).map(([floorNumber, floorSpaces]) =>
      renderFloor(floorSpaces, floorNumber)
    );
  };

  return (
    <div>
      <h1>Lowes Parking App</h1>
      <h2>Parking Simulation</h2>
      <div>
        <label>Day of Week: </label>
        <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
          <option value="Saturday">Saturday</option>
          <option value="Sunday">Sunday</option>
        </select>
      </div>
      <br />
      <label>Hour of Day: </label>
      <Slider
        value={hourOfDay}
        onChange={handleSliderChange}
        min={0}
        max={23}
        step={1}
        valueLabelDisplay="auto"
        valueLabelFormat={formatTime}
        marks={[
          { value: 0, label: 'Midnight' },
          { value: 6, label: '6 AM' },
          { value: 12, label: 'Noon' },
          { value: 18, label: '6 PM' },
          { value: 23, label: '11 PM' }
        ]}
      />
      <h3>Current Time: {currentTime.toLocaleTimeString()}</h3>
      <h3>Simulation Time: {formatTime(hourOfDay)}</h3>
      <h3>Percentage Occupied: {getPercentageOccupied()}%</h3>
      <h3>Simulation Results</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="parking-structure">
          {parkingSpaces.length === 0 ? (
            <p>No data available.</p>
          ) : (
            renderParkingStructure()
          )}
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Simulation;
