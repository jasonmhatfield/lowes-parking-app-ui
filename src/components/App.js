import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Simulation from './Simulation';
import Alerts from './Alerts';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Admin from './Admin';
import { Container, Button, Typography, Box, Paper } from '@mui/material';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const namedUsers = [
    { firstName: 'Jason', lastName: 'Hatfield', email: 'jason.hatfield@lowes.com', role: 'admin' },
    { firstName: 'John', lastName: 'Doe', email: 'john.doe@lowes.com', role: 'employee' },
    { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@lowes.com', role: 'employee', hasEv: true },
    { firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@lowes.com', role: 'employee', hasHandicapPlacard: true }
];

let stompClient = null;

function App() {
    const [selectedUser, setSelectedUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [gates, setGates] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGates = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/gates');
                setGates(response.data);
            } catch (error) {
                console.error('Error fetching gates:', error);
            }
        };

        fetchGates();

        const socket = new SockJS('http://localhost:8080/ws');
        stompClient = new Client({
            webSocketFactory: () => socket,
            debug: (str) => {
                console.log(str);
            },
            onConnect: () => {
                stompClient.subscribe('/topic/gates', (message) => {
                    const updatedGate = JSON.parse(message.body);
                    setGates((prevGates) => prevGates.map(gate => gate.gateId === updatedGate.gateId ? updatedGate : gate));
                });
            }
        });

        stompClient.activate();

        return () => {
            if (stompClient) {
                stompClient.deactivate();
            }
        };
    }, []);

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setIsAdmin(user.role === 'admin');
        if (user.role === 'admin') {
            navigate('/admin');
        }
    };

    const handleLogout = () => {
        setSelectedUser(null);
        setIsAdmin(false);
        navigate('/');
    };

    const updateGateStatus = (updatedGate) => {
        setGates(gates.map(gate => gate.gateId === updatedGate.gateId ? updatedGate : gate));
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Lowes Parking App</Typography>
            {!selectedUser ? (
                <>
                    <Typography variant="h6">Select User to Log In</Typography>
                    {namedUsers.map(user => (
                        <Button
                            key={user.email}
                            variant="contained"
                            onClick={() => handleUserSelect(user)}
                            style={{ margin: '5px' }}
                        >
                            {user.firstName} {user.lastName} - {user.role === 'admin' ? 'Admin' : user.hasEv ? 'EV' : user.hasHandicapPlacard ? 'Handicap' : 'Regular'}
                        </Button>
                    ))}
                </>
            ) : (
                <>
                    {isAdmin && <Navigate to="/admin" />}
                    {!isAdmin && (
                        <>
                            <Box component={Paper} padding={2} marginBottom={2}>
                                <Typography variant="h6" gutterBottom>Gate Status</Typography>
                                {gates.map(gate => (
                                    <Typography key={gate.gateId}>{gate.gateName}: {gate.isOperational ? 'Open' : 'Closed'}</Typography>
                                ))}
                            </Box>
                            <Simulation gates={gates} />
                            <Alerts userEmail={selectedUser.email} />
                        </>
                    )}
                </>
            )}

            <Routes>
                <Route path="/admin" element={<Admin onUpdateGateStatus={updateGateStatus} onLogout={handleLogout} />} />
                <Route path="/" element={<Simulation gates={gates} />} />
            </Routes>
        </Container>
    );
}

export default App;