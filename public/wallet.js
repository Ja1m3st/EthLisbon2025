// Add wallet address display element
const walletAddressElement = document.createElement('div');
walletAddressElement.className = 'wallet-address';
document.querySelector('.wallet-controls').insertBefore(walletAddressElement, document.getElementById('connectButton').nextSibling);

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById("connectButton");
    const disconnectButton = document.getElementById("disconnectButton");
    const walletAddressElement = document.querySelector('.wallet-address');

    if (!connectButton || !disconnectButton || !walletAddressElement) {
        console.error('Required elements not found in DOM');
        return;
    }

    connectButton.addEventListener('click', async () => {
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed');
            }

            // Request account access if needed
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Initialize ethers
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            walletAddressElement.textContent = `Connected: ${address}`;
            connectButton.disabled = true;
            disconnectButton.disabled = false;

            console.log('Connected to:', address);
        } catch (error) {
            console.error('Error connecting:', error);
            alert(error.message || 'Error connecting to wallet');
        }
    });

    disconnectButton.addEventListener('click', () => {
        walletAddressElement.textContent = '';
        connectButton.disabled = false;
        disconnectButton.disabled = true;
    });
});
