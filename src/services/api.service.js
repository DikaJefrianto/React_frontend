// API Service Layer for Flask Backend Integration
import { API_CONFIG, HttpMethod } from '../config/api.config';
import type {
  LoginCredentials,
  LoginResponse,
  InventoryItem,
  InventoryFormData,
  Supplier,
  SupplierFormData,
  Customer,
  CustomerFormData,
  TransactionRecord,
  TransactionCreateData,
  ReportSummary,
  FIFOAlert,
  ApiResponse,
} from '../types';

// API Client Class
class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    // Try to get token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  // Set auth token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Clear auth token
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    method: HttpMethod = HttpMethod.GET,
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token exists
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const config: RequestInit = {
        method,
        headers,
      };

      // Add body for POST, PUT, PATCH requests
      if (data && method !== HttpMethod.GET && method !== HttpMethod.DELETE) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Request failed');
      }

      return result;
    } catch (error: any) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred',
      };
    }
  }

  // ==================== AUTHENTICATION ====================
  
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>(
      API_CONFIG.ENDPOINTS.LOGIN,
      HttpMethod.POST,
      credentials
    );

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.request<void>(
      API_CONFIG.ENDPOINTS.LOGOUT,
      HttpMethod.POST
    );
    this.clearToken();
    return response;
  }

  // ==================== INVENTORY ====================

  async getInventory(): Promise<ApiResponse<InventoryItem[]>> {
    return this.request<InventoryItem[]>(API_CONFIG.ENDPOINTS.INVENTORY);
  }

  async getInventoryById(id: string): Promise<ApiResponse<InventoryItem>> {
    return this.request<InventoryItem>(API_CONFIG.ENDPOINTS.INVENTORY_BY_ID(id));
  }

  async createInventory(data: InventoryFormData): Promise<ApiResponse<InventoryItem>> {
    return this.request<InventoryItem>(
      API_CONFIG.ENDPOINTS.INVENTORY,
      HttpMethod.POST,
      data
    );
  }

  async updateInventory(id: string, data: InventoryFormData): Promise<ApiResponse<InventoryItem>> {
    return this.request<InventoryItem>(
      API_CONFIG.ENDPOINTS.INVENTORY_BY_ID(id),
      HttpMethod.PUT,
      data
    );
  }

  async deleteInventory(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(
      API_CONFIG.ENDPOINTS.INVENTORY_BY_ID(id),
      HttpMethod.DELETE
    );
  }

  // ==================== SUPPLIERS ====================

  async getSuppliers(): Promise<ApiResponse<Supplier[]>> {
    return this.request<Supplier[]>(API_CONFIG.ENDPOINTS.SUPPLIERS);
  }

  async getSupplierById(id: string): Promise<ApiResponse<Supplier>> {
    return this.request<Supplier>(API_CONFIG.ENDPOINTS.SUPPLIER_BY_ID(id));
  }

  async createSupplier(data: SupplierFormData): Promise<ApiResponse<Supplier>> {
    return this.request<Supplier>(
      API_CONFIG.ENDPOINTS.SUPPLIERS,
      HttpMethod.POST,
      data
    );
  }

  async updateSupplier(id: string, data: SupplierFormData): Promise<ApiResponse<Supplier>> {
    return this.request<Supplier>(
      API_CONFIG.ENDPOINTS.SUPPLIER_BY_ID(id),
      HttpMethod.PUT,
      data
    );
  }

  async deleteSupplier(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(
      API_CONFIG.ENDPOINTS.SUPPLIER_BY_ID(id),
      HttpMethod.DELETE
    );
  }

  // ==================== CUSTOMERS ====================

  async getCustomers(): Promise<ApiResponse<Customer[]>> {
    return this.request<Customer[]>(API_CONFIG.ENDPOINTS.CUSTOMERS);
  }

  async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
    return this.request<Customer>(API_CONFIG.ENDPOINTS.CUSTOMER_BY_ID(id));
  }

  async createCustomer(data: CustomerFormData): Promise<ApiResponse<Customer>> {
    return this.request<Customer>(
      API_CONFIG.ENDPOINTS.CUSTOMERS,
      HttpMethod.POST,
      data
    );
  }

  async updateCustomer(id: string, data: CustomerFormData): Promise<ApiResponse<Customer>> {
    return this.request<Customer>(
      API_CONFIG.ENDPOINTS.CUSTOMER_BY_ID(id),
      HttpMethod.PUT,
      data
    );
  }

  async deleteCustomer(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(
      API_CONFIG.ENDPOINTS.CUSTOMER_BY_ID(id),
      HttpMethod.DELETE
    );
  }

  // ==================== TRANSACTIONS ====================

  async getTransactions(): Promise<ApiResponse<TransactionRecord[]>> {
    return this.request<TransactionRecord[]>(API_CONFIG.ENDPOINTS.TRANSACTIONS);
  }

  async getTransactionById(id: string): Promise<ApiResponse<TransactionRecord>> {
    return this.request<TransactionRecord>(API_CONFIG.ENDPOINTS.TRANSACTION_BY_ID(id));
  }

  async createTransaction(data: TransactionCreateData): Promise<ApiResponse<TransactionRecord>> {
    return this.request<TransactionRecord>(
      API_CONFIG.ENDPOINTS.TRANSACTIONS,
      HttpMethod.POST,
      data
    );
  }

  async updateTransactionStatus(
    id: string,
    status: 'diproses' | 'selesai'
  ): Promise<ApiResponse<TransactionRecord>> {
    return this.request<TransactionRecord>(
      API_CONFIG.ENDPOINTS.TRANSACTION_BY_ID(id),
      HttpMethod.PATCH,
      { status }
    );
  }

  async deleteTransaction(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(
      API_CONFIG.ENDPOINTS.TRANSACTION_BY_ID(id),
      HttpMethod.DELETE
    );
  }

  // ==================== REPORTS ====================

  async getReportSummary(): Promise<ApiResponse<ReportSummary>> {
    return this.request<ReportSummary>(API_CONFIG.ENDPOINTS.REPORTS_SUMMARY);
  }

  async getFIFOAlerts(): Promise<ApiResponse<FIFOAlert[]>> {
    return this.request<FIFOAlert[]>(API_CONFIG.ENDPOINTS.REPORTS_FIFO);
  }

  async getTransactionReport(startDate: string, endDate: string): Promise<ApiResponse<any>> {
    return this.request<any>(
      `${API_CONFIG.ENDPOINTS.REPORTS_TRANSACTIONS}?start=${startDate}&end=${endDate}`
    );
  }
}

// Export singleton instance
export const apiService = new ApiService();
