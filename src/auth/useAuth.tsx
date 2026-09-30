import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { Persona } from '../types/index.ts';
import { AuthContextType, AuthState, LoginCredentials, AuthenticatedUser } from './types.ts';
import { authService } from './authService.ts';

const AuthHookContext = createContext<AuthContextType | null>(null);

/** Shared fallback so components still work when rendered outside AuthProvider. */
const useAuthFallback = (): AuthContextType => {
  const [state, setState] = useState<AuthState>(() => authService.getState());

  useEffect(() => authService.subscribe(setState), []);

  return {
    ...state,
    login: async (credentials: LoginCredentials) => { await authService.login(credentials); },
    logout: () => { authService.logout(); },
    sendOtp: async (mobile: string) => { await authService.sendOtp(mobile); },
    verifyOtp: async (mobile: string, otp: string) => { await authService.verifyOtp(mobile, otp); },
    loginWithDigiLocker: async () => { await authService.loginWithDigiLocker(); },
    loginAsPersona: async (personaId: string) => { await authService.loginAsPersona(personaId); },
    loginAsOfficer: async () => { await authService.loginAsOfficer(); },
    loginAsAdmin: async () => { await authService.loginAsAdmin(); },
    loginAsDemo: async (demoId: string) => { await authService.loginAsDemo(demoId); },
    clearError: () => { authService.clearError(); },
  };
};

export function AuthProvider({
  personas,
  children
}: {
  personas: Persona[];
  children: React.ReactNode;
}) {
  const [state, setState] = useState<AuthState>(() => authService.getState());

  useEffect(() => {
    authService.initialize(personas);
    return authService.subscribe(setState);
  }, [personas]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    await authService.login(credentials);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
  }, []);

  const sendOtp = useCallback(async (mobileNumber: string) => {
    await authService.sendOtp(mobileNumber);
  }, []);

  const verifyOtp = useCallback(async (mobileNumber: string, otp: string) => {
    await authService.verifyOtp(mobileNumber, otp);
  }, []);

  const loginWithDigiLocker = useCallback(async () => {
    await authService.loginWithDigiLocker();
  }, []);

  const loginAsPersona = useCallback(async (personaId: string) => {
    await authService.loginAsPersona(personaId);
  }, []);

  const loginAsOfficer = useCallback(async () => {
    await authService.loginAsOfficer();
  }, []);

  const loginAsAdmin = useCallback(async () => {
    await authService.loginAsAdmin();
  }, []);

  const loginAsDemo = useCallback(async (demoId: string) => {
    await authService.loginAsDemo(demoId);
  }, []);

  const clearError = useCallback(() => {
    authService.clearError();
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    sendOtp,
    verifyOtp,
    loginWithDigiLocker,
    loginAsPersona,
    loginAsOfficer,
    loginAsAdmin,
    loginAsDemo,
    clearError,
  };

  return (
    <AuthHookContext.Provider value={contextValue}>
      {children}
    </AuthHookContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthHookContext);
  const fallback = useAuthFallback();
  return context ?? fallback;
}
