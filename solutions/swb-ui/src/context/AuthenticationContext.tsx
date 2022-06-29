import { createContext, useContext, Context, useState } from 'react';
import { User, researcherUser } from '../models/User';

export interface AuthenticationProps {
  user: User;
  signIn: (user: User) => void;
  signOut: () => void;
}

const AuthenticationContext: Context<AuthenticationProps> = createContext<AuthenticationProps>({
  user: researcherUser,
  signIn: (user: User) => {
    // const token = localStorage.getItem('idToken');
    // const {sub, email} = decodeToken(token);
  },
  signOut: () => {}
});

export function AuthenticationProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [user, setUser] = useState<User>(researcherUser);
  const signIn = (user: User): void => setUser(user);
  const signOut = (): void => setUser(researcherUser);

  return (
    <AuthenticationContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthenticationContext.Provider>
  );
}

export function useAuthentication(): AuthenticationProps {
  return useContext(AuthenticationContext);
}
