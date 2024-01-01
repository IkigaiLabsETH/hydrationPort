// contexts/SolanaConnectionContext.tsx
import { Connection } from '@solana/web3.js';
import { createContext, useContext } from 'react';

export const SolanaConnectionContext = createContext<Connection | null>(null);

export const useSolanaConnection = () => {
    return useContext(SolanaConnectionContext);
};