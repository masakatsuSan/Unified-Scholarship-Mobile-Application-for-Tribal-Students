import { Persona } from '../types/index.ts';
import { LoginCredentials, AuthState, AuthenticatedUser, UserRole } from './types.ts';
import { DEMO_ACCOUNTS } from './demoAccounts.ts';

type AuthListener = (state: AuthState) => void;

const SESSION_KEY = 'saathi_session';

interface StoredSession {
  personaId: string;
  role: UserRole;
  personaName: string;
}

const readSession = (): StoredSession | null => {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.role || !parsed?.personaId) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeSession = (session: StoredSession | null) => {
  try {
    if (session) window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* sessionStorage unavailable (private mode) - session simply will not persist */
  }
};

class AuthService {
  private state: AuthState = {
    isLoggedIn: false,
    user: null,
    isLoading: false,
    error: null,
  };
  private listeners: AuthListener[] = [];
  private personas: Persona[] = [];

  initialize(personas: Persona[]): void {
    this.personas = personas;
  }

  subscribe(listener: AuthListener): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private setState(partial: Partial<AuthState>): void {
    this.state = { ...this.state, ...partial };
    // Keep the session tied to the live user so a reload keeps the same role.
    writeSession(this.state.isLoggedIn && this.state.user
      ? { personaId: this.state.user.personaId, role: this.state.user.role, personaName: this.state.user.personaName }
      : null);
    this.listeners.forEach(l => l(this.state));
  }

  /** Re-hydrate a session saved earlier in this tab. Call once before rendering. */
  restoreSession(): void {
    if (this.state.isLoggedIn) return;
    const session = readSession();
    if (!session) return;
    this.state = { isLoggedIn: true, isLoading: false, error: null, user: session };
    this.listeners.forEach(l => l(this.state));
  }

  getState(): AuthState {
    return { ...this.state };
  }

  resolveRole(personaId: string): UserRole {
    const persona = this.personas.find(p => p.id === personaId);
    if (persona?.isParent) return 'parent';
    if (persona?.role === 'student') return 'student';
    return 'student';
  }

  resolvePersona(personaId: string): Persona | undefined {
    return this.personas.find(p => p.id === personaId);
  }

  async login(credentials: LoginCredentials): Promise<void> {
    this.setState({ isLoading: true, error: null });
    try {
      let personaId = credentials.personaId || 'persona-1';

      if (credentials.method === 'otp') {
        await new Promise(resolve => setTimeout(resolve, 1200));
      } else if (credentials.method === 'digilocker') {
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else if (credentials.method === 'demo') {
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      const persona = this.resolvePersona(personaId);
      this.setState({
        isLoggedIn: true,
        isLoading: false,
        user: {
          personaId,
          role: this.resolveRole(personaId),
          personaName: persona?.name || 'User',
        },
      });
    } catch {
      this.setState({ error: 'Login failed. Please try again.', isLoading: false });
    }
  }

  async sendOtp(mobileNumber: string): Promise<void> {
    this.setState({ isLoading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 600));
    this.setState({ isLoading: false });
  }

  async verifyOtp(mobileNumber: string, otp: string): Promise<void> {
    this.setState({ isLoading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 800));
    if (otp !== '123456') {
      this.setState({ error: 'Incorrect OTP. Try again.', isLoading: false });
      return;
    }
    this.setState({
      isLoggedIn: true,
      isLoading: false,
      user: {
        personaId: 'persona-1',
        role: 'student',
        personaName: 'Ramesh Munda',
      },
    });
  }

  async loginWithDigiLocker(): Promise<void> {
    this.setState({ isLoading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 1200));
    this.setState({
      isLoggedIn: true,
      isLoading: false,
      user: {
        personaId: 'persona-1',
        role: 'student',
        personaName: 'Ramesh Munda',
      },
    });
  }

  async loginAsPersona(personaId: string): Promise<void> {
    this.setState({ isLoading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 300));
    const persona = this.resolvePersona(personaId);
    this.setState({
      isLoggedIn: true,
      isLoading: false,
      user: {
        personaId,
        role: this.resolveRole(personaId),
        personaName: persona?.name || 'User',
      },
    });
  }

  async loginAsOfficer(): Promise<void> {
    this.setState({ isLoading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 400));
    this.setState({
      isLoggedIn: true,
      isLoading: false,
      user: {
        personaId: 'officer-demo',
        role: 'officer',
        personaName: 'Dr. K. S. Meena, DWO',
      },
    });
  }

  async loginAsAdmin(): Promise<void> {
    this.setState({ isLoading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 400));
    this.setState({
      isLoggedIn: true,
      isLoading: false,
      user: {
        personaId: 'admin-demo',
        role: 'admin',
        personaName: 'MoTA National Monitoring Wing',
      },
    });
  }

  /**
   * Sign straight in as one of the ready-made demo accounts. Kept separate from
   * the credential flows so demos never depend on remembering an OTP.
   */
  async loginAsDemo(demoId: string): Promise<void> {
    const account = DEMO_ACCOUNTS.find(item => item.id === demoId);
    if (!account) {
      this.setState({ isLoggedIn: false, isLoading: false, error: 'That demo account is not available.' });
      return;
    }
    this.setState({ isLoading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 350));
    this.setState({
      isLoggedIn: true,
      isLoading: false,
      user: {
        personaId: account.personaId,
        role: account.role,
        personaName: account.name,
      },
    });
  }

  logout(): void {
    this.setState({ isLoggedIn: false, user: null, error: null });
    writeSession(null);
  }

  clearError(): void {
    this.setState({ error: null });
  }
}

export const authService = new AuthService();
