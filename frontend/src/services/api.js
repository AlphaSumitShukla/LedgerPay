/**
 * API Service for Backend Ledger
 * Communicates with the Express backend via Vite proxy (/api -> http://localhost:3000)
 */

const API_BASE = '/api';

/**
 * Custom Error class with status code and details
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Universal request handler
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const token = localStorage.getItem('ledger_auth_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
    credentials: 'include', // Include cookies for cookie-based auth support
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (netErr) {
    throw new ApiError(
      'Unable to connect to the backend server. Please make sure the backend is running on port 3000.',
      0,
      { originalError: netErr.message }
    );
  }

  // Parse JSON response
  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await response.text();
      data = { message: text };
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMessage =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status} (${response.statusText})`;
    
    // If unauthorized, clear stale credentials if token was invalid
    if (response.status === 401 && token) {
      // Dispatches custom event for the auth listener to react
      window.dispatchEvent(new CustomEvent('ledger_unauthorized'));
    }

    throw new ApiError(errorMessage, response.status, data);
  }

  return data;
}

export const api = {
  // Authentication endpoints
  auth: {
    /**
     * Register a new user
     * @param {{ name: string, email: string, password: string }} credentials
     */
    register: (credentials) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    /**
     * Log in an existing user
     * @param {{ email: string, password: string }} credentials
     */
    login: (credentials) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    /**
     * Log out current user (blacklists the token on backend)
     */
    logout: () =>
      request('/auth/logout', {
        method: 'POST',
      }),
  },

  // Account endpoints
  accounts: {
    /**
     * Create a new ledger account for the authenticated user
     */
    create: () =>
      request('/accounts', {
        method: 'POST',
      }),

    /**
     * Fetch all accounts belonging to the authenticated user
     */
    getAll: () =>
      request('/accounts', {
        method: 'GET',
      }),

    /**
     * Fetch the calculated balance of a specific account from the ledger
     * @param {string} accountId
     */
    getBalance: (accountId) =>
      request(`/accounts/balance/${accountId}`, {
        method: 'GET',
      }),
  },

  // Transaction endpoints
  transactions: {
    /**
     * Execute a transfer between two active accounts
     * @param {{ fromAccount: string, toAccount: string, amount: number, idempotencyKey: string }} payload
     */
    create: (payload) =>
      request('/transactions', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    /**
     * Inject initial funds into an account (System User only)
     * Note: Backend has a 15-second simulation lock before completion
     * @param {{ toAccount: string, amount: number, idempotencyKey: string }} payload
     */
    createInitialFunds: (payload) =>
      request('/transactions/system/initial-funds', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
};
