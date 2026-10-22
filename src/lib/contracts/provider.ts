import type { BrowserProvider, Eip1193Provider, JsonRpcSigner } from 'ethers';
import { CHAIN_CONFIG } from './contractConfig';

type WalletEvent = 'accountsChanged' | 'chainChanged';

interface InjectedWallet extends Eip1193Provider {
  on?: (event: WalletEvent, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: WalletEvent, listener: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: InjectedWallet;
  }
}

let _provider: BrowserProvider | null = null;
let _signer: JsonRpcSigner | null = null;

export function getProvider() {
  return _provider;
}

export function getSigner() {
  return _signer;
}

export async function connectWallet(): Promise<{ address: string; chainId: number } | null> {
  if (!window.ethereum) {
    throw new Error('No Web3 wallet was found. Install a wallet such as MetaMask and try again.');
  }

  const { BrowserProvider } = await import('ethers');
  _provider = new BrowserProvider(window.ethereum);
  await _provider.send('eth_requestAccounts', []);
  _signer = await _provider.getSigner();
  const [address, network] = await Promise.all([
    _signer.getAddress(),
    _provider.getNetwork(),
  ]);
  return { address, chainId: Number(network.chainId) };
}

export async function switchToPolygon(): Promise<void> {
  if (!window.ethereum) throw new Error('No Web3 wallet was found.');
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: CHAIN_CONFIG.chainIdHex }],
    });
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code !== 4902) throw error;
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: CHAIN_CONFIG.chainIdHex,
        chainName: CHAIN_CONFIG.name,
        nativeCurrency: CHAIN_CONFIG.nativeCurrency,
        rpcUrls: [CHAIN_CONFIG.rpcUrl],
        blockExplorerUrls: [CHAIN_CONFIG.explorerUrl],
      }],
    });
  }
}

export function subscribeWallet(
  onAccountsChanged: (accounts: string[]) => void,
  onChainChanged: (chainId: number) => void,
): () => void {
  const wallet = window.ethereum;
  if (!wallet?.on) return () => undefined;
  const accountHandler = (...args: unknown[]) => onAccountsChanged((args[0] as string[]) || []);
  const chainHandler = (...args: unknown[]) => onChainChanged(Number.parseInt(String(args[0]), 16));
  wallet.on('accountsChanged', accountHandler);
  wallet.on('chainChanged', chainHandler);
  return () => {
    wallet.removeListener?.('accountsChanged', accountHandler);
    wallet.removeListener?.('chainChanged', chainHandler);
  };
}

export async function disconnectWallet(): Promise<void> {
  _provider = null;
  _signer = null;
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
