import { fetchHighestBid } from '../api/magicEden';
import { fetchCoinPrice } from '../api/jupiter';
import axios from 'axios';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';

export const liquidateNFT = async (nftMintAddress: string, desiredCoin: string, connection: Connection, publicKey: string, signedTransaction: any) => {
    // Fetch the highest bid for the NFT
    const bidData = await fetchHighestBid(nftMintAddress);
    if (bidData === undefined) {
        console.error('Could not fetch highest bid');
        return;
    }    

    // Sell the NFT on Magic Eden
    const sellOptions = {
        method: 'GET',
        url: '/api/v2/instructions/mmm/sol-fulfill-sell',  // Changed to proxy URL
        params: {
            pool: bidData.poolId,  // Use the poolId from bidData
            assetAmount: 1,  // Assume we're selling 1 NFT
            maxPaymentAmount: bidData.highestBidInLamports,
            buysideCreatorRoyaltyBp: 0,  // Assume no royalty
            buyer: publicKey,  // TODO: Replace with actual buyer public key
            assetMint: nftMintAddress
        },
        headers: { accept: 'application/json' }
    };

    try {
        const sellResponse = await axios.request(sellOptions);
        console.log("sell response", sellResponse);

        // TODO: Process the sellResponse to actually sell the NFT
    } catch (error) {
        console.error(error);
        return;
    }

    // Swap the proceeds to the desired coin using Jupiter API
    const coinAmount = await fetchCoinPrice(desiredCoin, bidData.highestBidInLamports);
    if (coinAmount === undefined) {
        console.error('Could not fetch coin price');
        return;
    }

    // Get the route for a swap
    const quoteResponse = await (
      await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${desiredCoin}&amount=${bidData.highestBidInLamports * 1_000_000_000}&slippageBps=50`)
    ).json();

    // Get the serialized transactions to perform the swap
    const { swapTransaction } = await (
      await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: publicKey,  
          wrapAndUnwrapSol: true,
        })
      })
    ).json();

    // Deserialize the transaction
    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
    var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    console.log("transaction", transaction);


    const rawTransaction = signedTransaction.serialize();
    const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2
    });
    
    // Get the latest blockhash
    const { blockhash } = await connection.getRecentBlockhash();
    
    // Get the last valid block height
    const lastValidBlockHeight = await connection.getSlot();
    
    // Confirm the transaction
    await connection.confirmTransaction({
        signature: txid,
        blockhash,
        lastValidBlockHeight
    });

};