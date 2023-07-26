/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, Context, useState } from 'react';
import { User, unknownUser } from '../models/User';

export interface AuthenticationProps {
  user: User;
  signIn: (user: User) => void;
  signOut: () => void;
}

const AuthenticationContext: Context<AuthenticationProps> = createContext<AuthenticationProps>({
  user: unknownUser,
  signIn: (user: User) => {},
  signOut: () => {}
});

export function AuthenticationProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [user, setUser] = useState<User>(unknownUser);
  const signIn = (user: User): void => setUser(user);
  const signOut = (): void => setUser(unknownUser);

  return (
    <AuthenticationContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthenticationContext.Provider>
  );
}

export function useAuthentication(): AuthenticationProps {
  return useContext(AuthenticationContext);
}
