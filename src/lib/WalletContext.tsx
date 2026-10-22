import React, { useEffect, useState } from 'react';
import { connectWallet, disconnectWallet, formatAddress, subscribeWallet, switchToPolygon } from './contracts/provider';
import { CHAIN_CONFIG, IS_QA_CONNECTED_USER } from './contracts/contractConfig';
import { WalletContext, type WalletContextValue } from './wallet-context';
import { mockUser } from '../data/mockAssets';

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(() => IS_QA_CONNECTED_USER ? mockUser.walletAddress : null);
  const [chainId, setChainId] = useState<number | null>(() => IS_QA_CONNECTED_USER ? CHAIN_CONFIG.chainId : null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => subscribeWallet(
    (accounts) => setAddress(accounts[0] || null),
    (nextChainId) => setChainId(nextChainId),
  ), []);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const result = await connectWallet();
      if (result) {
        setAddress(result.address);
        setChainId(result.chainId);
        return true;
      }
      return false;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No compatible wallet was found. You can continue exploring without connecting.');
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    disconnectWallet();
    setAddress(null);
    setChainId(null);
    setError(null);
  };

  const switchNetwork = async () => {
    setError(null);
    try {
      await switchToPolygon();
      setChainId(CHAIN_CONFIG.chainId);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not switch network.');
    }
  };

  const value: WalletContextValue = {
    address,
    chainId,
    isConnected: Boolean(address),
    isConnecting,
    isCorrectNetwork: chainId === CHAIN_CONFIG.chainId,
    error,
    formattedAddress: address ? formatAddress(address) : '',
    connect,
    disconnect,
    switchNetwork,
  };

  return (
    <WalletContext.Provider
      value={value}
    >
      {children}
    </WalletContext.Provider>
  );
}
