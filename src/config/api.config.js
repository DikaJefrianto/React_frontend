// API Configuration for Flask Backend
export const API_CONFIG = {
  // Change this to your Flask backend URL
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    
    // Inventory
    INVENTORY: '/inventory',
    INVENTORY_BY_ID: (id: string) => `/inventory/${id}`,
    
    // Transactions
    TRANSACTIONS: '/transaksi',
    TRANSACTION_BY_ID: (id: string) => `/transaksi/${id}`,
    
    // Suppliers
    SUPPLIERS: '/suppliers',
    SUPPLIER_BY_ID: (id: string) => `/suppliers/${id}`,
    
    // Customers
    CUSTOMERS: '/customers',
    CUSTOMER_BY_ID: (id: string) => `/customers/${id}`,
    
    // Reports
    REPORTS_SUMMARY: '/reports/summary',
    REPORTS_FIFO: '/reports/fifo',
    REPORTS_TRANSACTIONS: '/reports/transaksi',
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
};

// HTTP Methods
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}
