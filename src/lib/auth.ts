// Mock admin data for frontend-only operation
const mockAdmins = [
  {
    id: '1',
    email: 'admin@guesthousepro.com',
    password: 'admin123',
    name: 'Admin User',
    profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    created_at: '2024-01-01T00:00:00Z',
    last_login: null,
    is_active: true
  }
];

export interface Admin {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  created_at: string;
  last_login: string | null;
  is_active: boolean;
}

export async function loginAdmin(email: string, password: string): Promise<Admin | null> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Trim whitespace from inputs to prevent login failures due to accidental spaces
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    const admin = mockAdmins.find(a => 
      a.email === trimmedEmail && 
      a.password === trimmedPassword && 
      a.is_active
    );

    if (!admin) {
      console.error('Login failed: Invalid credentials');
      return null;
    }

    // Update last login
    admin.last_login = new Date().toISOString();

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      profilePicture: admin.profilePicture,
      created_at: admin.created_at,
      last_login: admin.last_login,
      is_active: admin.is_active
    };
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

export async function createAdmin(email: string, password: string, name: string, createdBy: string, profilePicture?: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const existing = mockAdmins.find(a => a.email === email);
    if (existing) {
      return { success: false, error: 'An admin with this email already exists' };
    }

    const newAdmin = {
      id: Date.now().toString(),
      email,
      password,
      name,
      profilePicture: profilePicture || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      created_at: new Date().toISOString(),
      last_login: null,
      is_active: true
    };

    mockAdmins.push(newAdmin);
    return { success: true };
  } catch (error) {
    console.error('Create admin error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getAllAdmins(): Promise<Admin[]> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return mockAdmins.map(admin => ({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      profilePicture: admin.profilePicture,
      created_at: admin.created_at,
      last_login: admin.last_login,
      is_active: admin.is_active
    }));
  } catch (error) {
    console.error('Get admins error:', error);
    return [];
  }
}

export async function updateAdminStatus(adminId: string, isActive: boolean): Promise<boolean> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const admin = mockAdmins.find(a => a.id === adminId);
    if (admin) {
      admin.is_active = isActive;
      return true;
    }
    return false;
  } catch (error) {
    console.error('Update admin status error:', error);
    return false;
  }
}

export async function updateAdmin(adminId: string, updates: { name?: string; email?: string; profilePicture?: string }): Promise<{ success: boolean; error?: string }> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const admin = mockAdmins.find(a => a.id === adminId);
    if (!admin) {
      return { success: false, error: 'Admin not found' };
    }

    // Check if email is being changed and if it already exists
    if (updates.email && updates.email !== admin.email) {
      const existing = mockAdmins.find(a => a.email === updates.email && a.id !== adminId);
      if (existing) {
        return { success: false, error: 'An admin with this email already exists' };
      }
    }

    // Update admin fields
    if (updates.name) admin.name = updates.name;
    if (updates.email) admin.email = updates.email;
    if (updates.profilePicture !== undefined) admin.profilePicture = updates.profilePicture;

    return { success: true };
  } catch (error) {
    console.error('Update admin error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}