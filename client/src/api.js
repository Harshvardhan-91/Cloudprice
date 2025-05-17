const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

/**
 * Fetch instances from a specific cloud provider or all providers
 * @param {string} provider - 'aws', 'azure', 'gcp', or undefined for all
 * @param {boolean} refresh - Whether to force a refresh from the cloud APIs
 */
export async function fetchInstances(provider, refresh = false) {
  try {
    let url;
    if (provider) {
      url = `${API_BASE_URL}/instances/${provider}${refresh ? '?refresh=true' : ''}`;
    } else {
      url = `${API_BASE_URL}/instances`;
    }
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

/**
 * Compare instances across providers with detailed filtering
 * @param {Object} filters - Filtering parameters
 */
export async function compareInstances(filters) {
  try {
    const query = new URLSearchParams(filters).toString();
    const url = `${API_BASE_URL}/compare?${query}`;
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

/**
 * Get best pricing options for a specific configuration
 * @param {Object} specs - Required VM specifications
 */
export async function getBestPricing(specs) {
  try {
    const res = await fetch(`${API_BASE_URL}/compare/best-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(specs),
    });
    if (!res.ok) {
      throw new Error(`Failed to get best pricing: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error('Get best pricing error:', error);
    throw error;
  }
}

/**
 * Compare specific instances side by side
 * @param {Array<string>} instanceIds - Array of instance IDs to compare
 */
export async function compareSideBySide(instanceIds) {
  try {
    const res = await fetch(`${API_BASE_URL}/compare/side-by-side`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ instanceIds }),
    });
    if (!res.ok) {
      throw new Error(`Failed to compare instances side by side: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error('Side by side comparison error:', error);
    throw error;
  }
}