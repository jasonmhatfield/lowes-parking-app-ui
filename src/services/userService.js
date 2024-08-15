// src/services/usersService.js

export const fetchUsers = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    return data.filter(user => user.role !== 'admin');
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const updateUser = async (user) => {
  try {
    const response = await fetch(`http://localhost:8080/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });

    if (!response.ok) throw new Error('Error saving user');
    return await response.json();
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};
