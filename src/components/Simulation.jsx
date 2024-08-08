import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from '@mui/material/Slider';
import HandicapIcon from '@mui/icons-material/Accessible';
import EvIcon from '@mui/icons-material/EvStation';
import styled from 'styled-components';
import '../styles/Simulation.css';

const ParkingSpace = styled.div`
  &.handicap {
    background-color: blue;
  }

  &.ev {
    background-color: green;
  }

  &.occupied {
    background-color: rgba(216, 2, 2, 0.8);
  }
`;

const Simulation = ({ gates }) => {
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [hourOfDay, setHourOfDay] = useState(7);
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [loading, setLoading] = useState(false);
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
      }, 500));
    }
  }, [dayOfWeek, hourOfDay]);

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
        <ParkingSpace key={space.spaceId} className={className} data-testid="parking-space">
          <span className="space-number">{space.spaceNumber}</span>
          {space.type === 'handicap' && <HandicapIcon className="icon" />}
          {space.type === 'ev' && <EvIcon className="icon" />}
        </ParkingSpace>
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
        <h2>Parking Simulation</h2>
        <div>
          <label>Day of Week: </label>
          <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} data-testid="day-of-week-select">
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
        <Slider className="time-slider"
                value={hourOfDay}
                onChange={handleSliderChange}
                min={0}
                max={23}
                step={1}
                valueLabelDisplay="auto"
                valueLabelFormat={formatTime}
                marks={[
                  { value: 0, label: '12 AM' },
                  { value: 6, label: '6 AM' },
                  { value: 12, label: 'Noon' },
                  { value: 18, label: '6 PM' },
                  { value: 23, label: '11 PM' }
                ]}
                data-testid="hour-of-day-slider"
        />
        <h3>Time of Day: {formatTime(hourOfDay)}</h3>
        <h3>Percentage Occupied: {getPercentageOccupied()}%</h3>
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
        {error && <p style={{ color: 'red' }} data-testid="error-message">{error}</p>}
        <h3>Gate Status</h3>
        {gates.map(gate => (
            <p key={gate.gateId}>{gate.gateName}: {gate.isOperational ? 'Open' : 'Closed'}</p>
        ))}
      </div>
  );
};

export default Simulation;
