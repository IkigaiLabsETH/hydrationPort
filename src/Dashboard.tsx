import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
const hydrationPort = new URL('./assets/hydrationPort.png', import.meta.url).href;
import { fetchUserNFTs } from './api/metaplex';
import { Metadata, Nft, Sft } from "@metaplex-foundation/js";
import { useSolanaConnection } from './context/SolanaConnectionContext';
import { PublicKey } from '@solana/web3.js';
import Swap from './Swap';

type NFT = (Metadata | Nft | Sft) & { image?: string; mintAddress?: PublicKey };

const Dashboard = () => {
    const { connected, publicKey } = useWallet();
    const connection = useSolanaConnection();
    const [userNFTs, setUserNFTs] = useState<NFT[] | null>(null);
    const [selectedNft, setSelectedNft] = useState<NFT | null>(null);

    useEffect(() => {
        if (connected && publicKey && connection) {
            fetchUserNFTs(publicKey.toBase58(), connection)
                .then(nfts => {
                    // Fetch the image for each NFT
                    const fetches = nfts.map(nft =>
                        fetch(nft.uri)
                            .then(response => response.json())
                            .then(data => ({
                                ...nft,
                                image: data.image,  // Assume the image URL is stored in the `image` property of the JSON
                            }))
                    );
    
                    Promise.all(fetches)
                        .then(setUserNFTs)
                        .catch(console.error);
                })
                .catch(console.error);
        }
    }, [connected, publicKey, connection]);

    if (selectedNft) {
        return <Swap nft={selectedNft} setNft={setSelectedNft} />;
    }


    return (
        connected ? (
            <div>
                <h2>Welcome</h2>
                {/* Display user NFTs here */}
                {userNFTs && userNFTs.map((nft: NFT, index: number) => (
            <div key={index}>
                <h3>{nft.name}</h3>
                <div className="nft-item">
                    <img src={nft.image} alt={nft.name} />
                    {nft.mintAddress && <button onClick={() => setSelectedNft(nft)}>Liquidate</button>}
                </div>
            </div>
        ))}
            </div>
        ) : (
            <div className='top-hero'>
                <img className="hydrationport-logo" src={hydrationPort} alt="hydrationport" />
                <div className="card">
                    <h2>
                        Liquidate your NFTs into your favorite token today!
                    </h2>
                </div>
            </div>
        )
    );
};

export default Dashboard;