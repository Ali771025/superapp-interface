import { createContext, useContext } from 'react';

export interface WalletContextValue {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  error: string | null;
  formattedAddress: string;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
}

export const WalletContext = createContext<WalletContextValue>({
  address: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  isCorrectNetwork: false,
  error: null,
  formattedAddress: '',
  connect: async () => false,
  disconnect: () => undefined,
  switchNetwork: async () => undefined,
});

export function useWallet() {
  return useContext(WalletContext);
}
