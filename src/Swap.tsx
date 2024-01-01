import React, { useState } from 'react';
import { Metadata, Nft, Sft } from "@metaplex-foundation/js";
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { fetchHighestBid } from './api/magicEden';
import { fetchCoinPrice } from './api/jupiter';
import { liquidateNFT } from './services/liquidationService';
import { useSolanaConnection } from './context/SolanaConnectionContext';


type NFT = (Metadata | Nft | Sft) & { image?: string; mintAddress?: PublicKey };

type SwapProps = {
  nft: NFT;
  setNft: React.Dispatch<React.SetStateAction<NFT | null>>;
};

const Swap: React.FC<SwapProps> = ({ nft, setNft }) => {
    const [coin, setCoin] = useState('');
    const [coinAmount, setCoinAmount] = useState<number | null>(null);

    const connection = useSolanaConnection();
    const { wallet, publicKey, signTransaction } = useWallet();
    

    const handleLiquidate = async () => {
        if (nft.mintAddress && coin && connection && wallet && publicKey && signTransaction) {
            await liquidateNFT(nft.mintAddress.toString(), coin, connection, publicKey.toString(), signTransaction);
        }
    };

    const calculateSwapAmount = async () => {
        if (nft.mintAddress && coin) {
            const bidData = await fetchHighestBid(nft.mintAddress.toString());
            if (bidData !== undefined) {
                const calculatedCoinAmount = await fetchCoinPrice(coin, bidData.highestBidInLamports);
                setCoinAmount(calculatedCoinAmount);
            } else {
                console.error('Could not fetch highest bid');
            }
        }
    };

    const reset = () => {
        setCoin('');
        setCoinAmount(null);
    };

    if (coinAmount !== null) {
        return (
            <div>
                <h2>Swap Result</h2>
                <p>You could swap {nft.name} for {coinAmount} of {coin} right now.</p>
                <button onClick={reset}>Back</button>
                <button onClick={handleLiquidate}>Confirm</button>
            </div>
        );
    }

    return (
        <div>
            <h2>Swap</h2>
            <div>
                <h3>NFT</h3>
                <p>{nft.name}</p>
                <img src={nft.image} alt={nft.name} />
            </div>
            <div>
                <h3>Coin</h3>
                <input type="text" value={coin} onChange={e => setCoin(e.target.value)} placeholder="Enter coin" />
            </div>
            <button onClick={calculateSwapAmount}>Calculate</button>
            <button onClick={() => setNft(null)}>Back to Dashboard</button>
        </div>
    );
};

export default Swap;