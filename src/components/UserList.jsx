import React from 'react';
import { List, ListItem, ListItemText, Button, Typography } from '@mui/material';

const UserList = ({ users, onEdit, onDelete }) => (
  <>
    <Typography variant="h6" gutterBottom>Manage Users</Typography>
    <List style={{ maxHeight: 400, overflow: 'auto' }}>
      {users.map(user => (
        <ListItem button onClick={() => onEdit(user)} key={user.userId} divider>
          <ListItemText
            primary={`${user.firstName} ${user.lastName}`}
            secondary={`Email: ${user.email}, Role: ${user.role}`}
          />
          <Button onClick={() => onDelete(user.userId)} color="secondary">Delete</Button>
        </ListItem>
      ))}
    </List>
  </>
);

export default UserList;
