import { createContext, useContext, useState } from 'react';
import { User, unknownUser } from '../models/User';

const AuthenticationContext = createContext({
  user: unknownUser,
  signIn: (user: User) => {},
  signOut: () => {}
});

export function AuthenticationProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(unknownUser);
  const signIn = (user: User) => setUser(user);
  const signOut = () => setUser(unknownUser);

  return (
    <AuthenticationContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthenticationContext.Provider>
  );
}

export function useAuthentication() {
  return useContext(AuthenticationContext);
}
