import type { ReactNode, FC } from 'react';

interface Web3AuthProviderProps {
  children: ReactNode;
}

export const Web3AuthProvider: FC<Web3AuthProviderProps> = ({ children }) => {
  // TODO: Implementing Web3Auth integration
  // This is a pass-through provider to fix
  return <>{children}</>;
};