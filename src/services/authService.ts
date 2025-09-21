import { User } from '../types';

// Demo users for different roles
const DEMO_USERS: User[] = [
  {
    id: 'resident-1',
    email: 'john.smith@gmail.com',
    name: 'John Smith',
    role: 'resident',
    permissions: ['view_own_usage', 'create_service_request', 'contact_contractors'],
    householdId: 'household-1'
  },
  {
    id: 'contractor-1',
    email: 'mike@aquafixpro.co.za',
    name: 'Mike Rodriguez',
    role: 'contractor',
    permissions: ['view_service_requests', 'update_service_status', 'contact_residents'],
    contractorId: '1'
  },
  {
    id: 'municipal-officer-1',
    email: 'sarah.mthembu@capetown.gov.za',
    name: 'Sarah Mthembu',
    role: 'municipal_officer',
    municipality: 'City of Cape Town',
    department: 'Water and Sanitation',
    permissions: ['view_ward_data', 'manage_service_requests', 'contact_contractors', 'generate_reports']
  },
  {
    id: 'municipal-admin-1',
    email: 'admin@capetown.gov.za',
    name: 'David van der Merwe',
    role: 'municipal_admin',
    municipality: 'City of Cape Town',
    department: 'Administration',
    permissions: ['full_access', 'manage_users', 'system_configuration', 'financial_reports']
  }
];

class AuthService {
  private currentUser: User | null = null;
  private isAuthenticated = false;

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = DEMO_USERS.find(u => u.email === email);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // In demo, any password works for simplicity
    if (password.length < 3) {
      return { success: false, error: 'Invalid password' };
    }

    this.currentUser = user;
    this.isAuthenticated = true;
    
    // Store in localStorage for persistence
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');

    return { success: true, user };
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    this.isAuthenticated = false;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      // Try to restore from localStorage
      const storedUser = localStorage.getItem('currentUser');
      const storedAuth = localStorage.getItem('isAuthenticated');
      
      if (storedUser && storedAuth === 'true') {
        this.currentUser = JSON.parse(storedUser);
        this.isAuthenticated = true;
      }
    }
    
    return this.currentUser;
  }

  isUserAuthenticated(): boolean {
    if (!this.isAuthenticated) {
      const storedAuth = localStorage.getItem('isAuthenticated');
      this.isAuthenticated = storedAuth === 'true';
    }
    return this.isAuthenticated;
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return user.permissions.includes(permission) || user.permissions.includes('full_access');
  }

  getDemoUsers(): User[] {
    return DEMO_USERS.map(user => ({
      ...user,
      // Don't expose sensitive info in demo
      email: user.email
    }));
  }
}

export const authService = new AuthService();