import axios from 'axios';

export const fetchHighestBid = async (mintAddress: string) => {
    const options = {
        method: 'GET',
        url: `/api/v2/mmm/token/${mintAddress}/pools`,
        params: { limit: '5' },
        headers: { accept: 'application/json' }
    };

    try {
        const response = await axios.request(options);
        console.log("response from me", response);
        // Assume the highest bid is in the `spotPrice` property of each item in the `results` array
        const highestBidInLamports = Math.max(...response.data.results.map((item: any) => item.spotPrice)); // Convert lamports to SOL
        const poolId = response.data.results[0].poolKey;  // Assume the pool ID is in the `poolKey` property of the first item in the `results` array
        console.log("highest bid in sol", response);
        return { highestBidInLamports, poolId };
    } catch (error) {
        console.error(error);
    }
};