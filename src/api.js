// api.js
export const fetchGates = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/gates');
    if (!response.ok) throw new Error('Failed to fetch gates');
    return await response.json();
  } catch (error) {
    console.error('Error fetching gates:', error);
    throw error;
  }
};

export const toggleGateStatus = async (id, currentStatus) => {
  try {
    const response = await fetch(`http://localhost:8080/api/gates/${id}?isOperational=${!currentStatus}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Error updating gate status');
    return true;
  } catch (error) {
    console.error('Error updating gate status:', error);
    throw error;
  }
};
