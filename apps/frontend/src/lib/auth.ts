import { User, CreateSessionRequest } from '@/types';

class AuthService {
  private static instance: AuthService;
  private userId: string | null = null;
  private user: User | null = null;

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Load userId from localStorage on initialization
   */
  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      this.userId = localStorage.getItem('userId');
    }
  }

  /**
   * Check if user exists in localStorage
   */
  public hasUserId(): boolean {
    return this.userId !== null && this.userId !== '';
  }

  /**
   * Get current userId
   */
  public getUserId(): string | null {
    return this.userId;
  }

  /**
   * Get current user
   */
  public getUser(): User | null {
    return this.user;
  }

  /**
   * Set user data and save to localStorage
   */
  public setUser(user: User): void {
    this.user = user;
    this.userId = user.id;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('userId', user.id);
    }
  }

  /**
   * Clear user data and remove from localStorage
   */
  public clearUser(): void {
    this.user = null;
    this.userId = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
    }
  }

  /**
   * Get headers for API requests with userId
   */
  public getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.userId) {
      headers['Authorization'] = `Bearer ${this.userId}`;
    }
    return headers;
  }

  /**
   * Create session request data
   */
  public getSessionRequest(): CreateSessionRequest {
    return {
      userId: this.userId || undefined
    };
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.hasUserId() && this.user !== null;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
