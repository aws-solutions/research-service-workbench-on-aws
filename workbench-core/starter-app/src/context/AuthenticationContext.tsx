import { createContext, useContext, Context, useState } from 'react';
import { User, unkownUser } from '../models/User';

export interface AuthenticationProps {
  user: User;
  signIn: (user: User) => void;
  signOut: () => void;
}

const AuthenticationContext: Context<AuthenticationProps> = createContext<AuthenticationProps>({
  user: unkownUser,
  signIn: (user: User) => {},
  signOut: () => {}
});

export function AuthenticationProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [user, setUser] = useState<User>(unkownUser);
  const signIn = (user: User): void => setUser(user);
  const signOut = (): void => setUser(unkownUser);

  return (
    <AuthenticationContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthenticationContext.Provider>
  );
}

export function useAuthentication(): AuthenticationProps {
  return useContext(AuthenticationContext);
}
