export const fetchUsers = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/users'); // Fetch the list of users
    if (!response.ok) throw new Error('Failed to fetch users'); // Handle HTTP errors
    const data = await response.json(); // Parse response as JSON
    return data.filter(user => user.role !== 'admin'); // Return only non-admin users
  } catch (error) {
    console.error('Error fetching users:', error);
    return []; // Return an empty array in case of error
  }
};

export const updateUser = async (user) => {
  try {
    const response = await fetch(`http://localhost:8080/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user), // Send updated user data
    });

    if (!response.ok) throw new Error('Error saving user'); // Handle HTTP errors
    return await response.json(); // Return the updated user data
  } catch (error) {
    console.error('Error saving user:', error);
    throw error; // Re-throw the error for further handling
  }
};
