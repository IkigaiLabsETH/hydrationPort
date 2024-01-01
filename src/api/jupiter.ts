import axios from 'axios';

export const fetchCoinPrice = async (outputMint: string, amountInSol: number) => {
    const amountInLamports = amountInSol * 1_000_000_000;
    const inputMint = 'So11111111111111111111111111111111111111112';
    const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountInLamports}&slippageBps=1`;

    try {
        const response = await axios.get(url);
        return response.data.outAmount;
    } catch (error) {
        console.error(error);
    }
};