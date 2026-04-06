'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  isConnected,
  getAddress,
  getNetwork,
  signTransaction,
  setAllowed,
} from '@stellar/freighter-api';

const TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';
const PUBLIC_PASSPHRASE = 'Public Global Stellar Network ; September 2015';

interface WalletContextType {
  publicKey: string | null;
  network: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sign: (xdr: string, network?: 'TESTNET' | 'PUBLIC') => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      console.log('Wallet: Checking connection status...');
      const connected = await isConnected();
      if (!connected) {
        throw new Error('Freighter extension not found. Please install it.');
      }

      console.log('Wallet: Fetching address...');
      const { address, error: addressError } = await getAddress();
      
      if (address) {
        console.log('Wallet: Fetching network...');
        const { network: currentNetwork } = await getNetwork();
        
        if (currentNetwork !== 'TESTNET') {
          throw new Error('Please switch to Testnet in Freighter settings');
        }
        
        setPublicKey(address);
        setNetwork(currentNetwork);
        console.log('Wallet: Successfully connected to Testnet with address:', address);
      } else {
        console.log('Wallet: Address not found or unauthorized. Requesting access...');
        const allowed = await setAllowed();
        if (allowed) {
          const { address: newAddress, error: retryError } = await getAddress();
          if (newAddress) {
            const { network: currentNetwork } = await getNetwork();
            if (currentNetwork !== 'TESTNET') {
              throw new Error('Please switch to Testnet in Freighter settings');
            }
            setPublicKey(newAddress);
            setNetwork(currentNetwork);
          } else {
            throw new Error(retryError || 'Failed to retrieve address after authorization');
          }
        } else {
          throw new Error('User denied access request');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Wallet: Connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setPublicKey(null);
    setError(null);
  };

  const sign = async (xdr: string, network: 'TESTNET' | 'PUBLIC' = 'TESTNET') => {
    try {
      const networkPassphrase = network === 'TESTNET' ? TESTNET_PASSPHRASE : PUBLIC_PASSPHRASE;
      const result = await signTransaction(xdr, { networkPassphrase });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.signedTxXdr;
    } catch (err: any) {
      console.error('Transaction signing error:', err);
      throw err;
    }
  };

  // Check connection status on mount (silent check)
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (await isConnected()) {
          const { address } = await getAddress();
          if (address) {
            setPublicKey(address);
          }
        }
      } catch (err) {
        // Silent fail on mount
      }
    };
    checkConnection();
  }, []);

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        network,
        isConnected: !!publicKey,
        isConnecting,
        error,
        connect,
        disconnect,
        sign,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
