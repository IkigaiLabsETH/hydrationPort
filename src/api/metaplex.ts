import { Metaplex, FindNftsByOwnerInput } from "@metaplex-foundation/js";
import { PublicKey, Connection } from '@solana/web3.js';

export const fetchUserNFTs = async (publicKey: string, connection: Connection) => {
    const metaplex = new Metaplex(connection);
    const input: FindNftsByOwnerInput = {
        owner: new PublicKey(publicKey),
        // add other required properties here
    };
    const ownerNFTs = await metaplex.nfts().findAllByOwner(input);
    return ownerNFTs;
};