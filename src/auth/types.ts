export type UserRole = 'student' | 'parent' | 'officer' | 'admin';

export interface AuthenticatedUser {
  personaId: string;
  role: UserRole;
  personaName: string;
}

export interface LoginCredentials {
  mobileNumber?: string;
  otp?: string;
  personaId?: string;
  method: 'otp' | 'digilocker' | 'demo';
}

export interface AuthState {
  isLoggedIn: boolean;
  user: AuthenticatedUser | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  sendOtp: (mobileNumber: string) => Promise<void>;
  verifyOtp: (mobileNumber: string, otp: string) => Promise<void>;
  loginWithDigiLocker: () => Promise<void>;
  loginAsPersona: (personaId: string) => Promise<void>;
  loginAsOfficer: () => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  loginAsDemo: (demoId: string) => Promise<void>;
  clearError: () => void;
}
