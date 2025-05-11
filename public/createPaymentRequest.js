export function createPaymentRequest({ to, amount, currency = 'USDRIF', chainId = 30 }) {
    return {
        version: 'x402',
        chainId,
        currency,
        to,
        amount,
        timestamp: Date.now(),
        description: 'Payment with USDRIF via x402 SDK',
    };
}
