import { createContext, useContext, Context, useState } from 'react';
import { UserItem, researcherUser } from '../models/User';

export interface AuthenticationProps {
  user: UserItem;
  signIn: (user: UserItem) => void;
  signOut: () => void;
}

const AuthenticationContext: Context<AuthenticationProps> = createContext<AuthenticationProps>({
  user: researcherUser,
  signIn: (user: UserItem) => {},
  signOut: () => {}
});

export function AuthenticationProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [user, setUser] = useState<UserItem>(researcherUser);
  const signIn = (user: UserItem): void => setUser(user);
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
