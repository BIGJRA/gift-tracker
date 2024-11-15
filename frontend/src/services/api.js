// src/services/api.js

const API_URL = 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to login');
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getGifts = async () => {
  try {
    const response = await fetch(`${API_URL}/gifts`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch gifts');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching gifts:', error);
    throw error;
  }
};

export const addGift = async ({ recipient_name, gift_name, status, link }) => {
  try {
    const response = await fetch(`${API_URL}/gifts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ recipient_name, gift_name, status, link }),
    });
    if (!response.ok) {
      throw new Error('Failed to add gift');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding gift:', error);
    throw error;
  }
};
