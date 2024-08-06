import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Alerts = ({ userEmail }) => {
  const [alerts, setAlerts] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/users');
        const users = response.data;
        const user = users.find(u => u.email === userEmail);
        if (user) {
          setUserId(user.userId);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUserId();
  }, [userEmail]);

  useEffect(() => {
    if (!userId) return;

    const fetchAlerts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/alerts', {
          params: { userId }
        });
        setAlerts(response.data);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };

    fetchAlerts();
  }, [userId]);

  return (
    <div>
      <h2>Alerts</h2>
      <ul data-testid="alerts-list">
        {alerts.map((alert, index) => (
          <li key={index} data-testid="alert-item">{alert.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default Alerts;
