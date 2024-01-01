import { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { SolanaConnectionContext } from './context/SolanaConnectionContext';
import { Connection } from '@solana/web3.js';

import {
    WalletModalProvider,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';

import '@solana/wallet-adapter-react-ui/styles.css';
import './App.css'
import Dashboard from './Dashboard';

//import vite process env
const customRpcUrl = import.meta.env.VITE_REACT_APP_CUSTOM_RPC_URL;
console.log("url", customRpcUrl);
const App: FC = () => {

    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = useMemo(() => customRpcUrl, []);
    const connection = useMemo(() => new Connection(endpoint), [endpoint]);

    
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
        ],
        [network]
    );

    return (
      <SolanaConnectionContext.Provider value={connection}>
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                <div className="connect">  <WalletMultiButton /></div>
                        <Dashboard />
                    
 
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
        </SolanaConnectionContext.Provider>
    );
};

export default App;