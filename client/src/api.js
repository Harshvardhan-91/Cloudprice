const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export async function fetchInstances(provider) {
  try {
    const url = provider ? `${API_BASE_URL}/pricing/${provider}` : `${API_BASE_URL}/pricing`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${provider ? provider.toUpperCase() : 'all'} instances: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Fetch instances error for ${provider || 'all'}:`, error);
    throw error;
  }
}

export async function compareInstances(params) {
  try {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/pricing/compare?${query}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to compare instances: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error('Compare instances error:', error);
    throw error;
  }
}