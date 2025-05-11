// Wallet connect & balances
let walletAddress = null;

async function connectWallet() {
    if (!window.x402) {
        alert('x402 wallet extension not detected.');
        return;
    }
    try {
        const accounts = await window.x402.request({ method: 'eth_requestAccounts' });
        walletAddress = accounts[0];
        document.getElementById('walletAddress').textContent = walletAddress;
        await fetchAndDisplayBalances(walletAddress);
    } catch (e) {
        alert('Could not connect wallet.');
    }
}

async function fetchAndDisplayBalances(address) {
    // Puedes reemplazar esto con una llamada real a un backend o a la blockchain
    // Aquí solo mostramos un ejemplo estático
    // Ejemplo: obtener saldo de xDAI y USDC usando una API pública o ethers.js/web3.js
    const balances = [
        { symbol: 'xDAI', amount: '123.45' },
        { symbol: 'USDC', amount: '67.89' },
        { symbol: 'WETH', amount: '0.321' }
    ];
    renderBalances(balances);
}

function renderBalances(balances) {
    const container = document.getElementById('balancesContainer');
    if (!container) return;
    container.innerHTML = '';
    balances.forEach(bal => {
        const card = document.createElement('div');
        card.className = 'balance-card';
        card.innerHTML = `<div class="balance-amount">${bal.amount}</div><div class="balance-symbol">${bal.symbol}</div>`;
        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const connectBtn = document.getElementById('connectWalletBtn');
    if (connectBtn) connectBtn.onclick = connectWallet;
});

// Funciones globales
function addMessage(text, type) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    if (type === 'ai') {
        // Procesar el texto como markdown
        messageDiv.innerHTML = processMarkdown(text);
    } else {
        messageDiv.textContent = text;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function processMarkdown(text) {
    // Reemplazar ### con <h3>
    text = text.replace(/### (.*?)(?=\n|$)/g, '<h3>$1</h3>');
    
    // Reemplazar **texto** con <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Procesar listas numeradas
    text = text.replace(/(\d+)\.\s+(.*?)(?=\n\d+\.|$)/g, '<li>$2</li>');
    text = text.replace(/(<li>.*?<\/li>\n?)+/g, '<ol>$&</ol>');
    
    // Procesar listas con viñetas
    text = text.replace(/- (.*?)(?=\n-|$)/g, '<li>$1</li>');
    text = text.replace(/(<li>.*?<\/li>\n?)+/g, '<ul>$&</ul>');
    
    // Procesar párrafos
    text = text.replace(/([^\n]+)(?=\n\n|$)/g, '<p>$1</p>');
    
    // Procesar código en línea
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Procesar bloques de código
    text = text.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
    
    // Procesar citas
    text = text.replace(/> (.*?)(?=\n|$)/g, '<blockquote>$1</blockquote>');
    
    // Procesar enlaces
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    
    return text;
}

async function getERC20Balances(address) {
    // Lista de tokens populares en Gnosis Chain (puedes agregar más)
    const tokens = [
        { symbol: 'xDAI', address: null, decimals: 18 }, // Native
        { symbol: 'USDC', address: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83', decimals: 6 },
        { symbol: 'WXDAI', address: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', decimals: 18 },
        { symbol: 'WETH', address: '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1', decimals: 18 },
        { symbol: 'WBTC', address: '0x8e5bBbb09Ed1ebdE8674Cda39A0c169401db4252', decimals: 8 }
    ];
    if (!window.ethereum || !window.connectedAccount) return [];
    const provider = new ethers.BrowserProvider(window.ethereum);
    const balances = [];
    // Native xDAI
    const nativeBal = await provider.getBalance(window.connectedAccount);
    balances.push({ symbol: 'xDAI', amount: ethers.formatUnits(nativeBal, 18) });
    // ERC20 tokens
    const erc20Abi = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"];
    for (const token of tokens) {
        if (!token.address) continue; // Skip native
        try {
            const contract = new ethers.Contract(token.address, erc20Abi, provider);
            const bal = await contract.balanceOf(window.connectedAccount);
            balances.push({ symbol: token.symbol, amount: ethers.formatUnits(bal, token.decimals) });
        } catch (e) {
            balances.push({ symbol: token.symbol, amount: '0' });
        }
    }
    return balances;
}

async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    
    if (message) {
        addMessage(message, 'user');
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // Mostrar indicador de carga
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai-message';
        loadingDiv.textContent = 'Thinking...';
        document.getElementById('chat-messages').appendChild(loadingDiv);
        
        // Obtener balances si hay wallet conectada
        let balances = [];
        if (window.connectedAccount) {
            try {
                balances = await getERC20Balances(window.connectedAccount);
            } catch (e) { balances = []; }
        }
        // Hacer la petición al servidor
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message, balances: balances })
        })
        .then(response => response.json())
        .then(data => {
            loadingDiv.remove();
            addMessage(data.reply, 'ai');
        })
        .catch(error => {
            console.error('Error:', error);
            loadingDiv.remove();
            addMessage('⚠️ Error procesando consulta', 'ai');
        });
    }
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    const userInput = document.getElementById('userInput');

    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Send message on Enter (but allow Shift+Enter for new line)
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

}); 

// TokenService.js functionality moved here
const GNOSIS_RPC_URL = 'https://rpc.gnosischain.com/';
const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)'
];

async function fetchTokenBalances(address) {
    if (!address) return null;
    
    try {
        const provider = new ethers.JsonRpcProvider(GNOSIS_RPC_URL);
        
        // Get native xDAI balance
        const nativeBalance = await provider.getBalance(address);
        const nativeBalanceFormatted = ethers.utils.formatUnits(nativeBalance, 18);
        
        // Common Gnosis Chain tokens
        const tokenContracts = [
            { address: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83', symbol: 'USDC' },
            { address: '0xe91D153E0b41518A2Ce8dD3D7944Fa863463a97d', symbol: 'WXDAI' },
            { address: '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1', symbol: 'WETH' },
            { address: '0x8e5bBbb09Ed1ebdE8674Cda39A0c169401db4252', symbol: 'WBTC' },
            { address: '0x4922a015c4407f87432b179bb209e125432e4a2a', symbol: 'TRBTC' }
        ];

        const tokensWithBalance = [{
            contractAddress: null,
            symbol: 'xDAI',
            balance: nativeBalance.toString(),
            formattedBalance: nativeBalanceFormatted,
            decimals: 18
        }];

        for (const token of tokenContracts) {
            try {
                const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
                const [balance, decimals, symbol] = await Promise.all([
                    contract.balanceOf(address),
                    contract.decimals(),
                    contract.symbol()
                ]);
                
                const formattedBalance = ethers.utils.formatUnits(balance, decimals);
                if (Number(formattedBalance) > 0) {
                    tokensWithBalance.push({
                        contractAddress: token.address,
                        symbol: symbol,
                        balance: balance.toString(),
                        formattedBalance: formattedBalance,
                        decimals: decimals
                    });
                }
            } catch (error) {
                console.error(`Error fetching ${token.symbol}:`, error);
            }
        }

        const totalValue = tokensWithBalance.reduce((sum, token) => 
            sum + Number(token.formattedBalance), 0);
        
        return {
            tokens: tokensWithBalance.sort((a, b) => 
                Number(b.formattedBalance) - Number(a.formattedBalance)),
            totalValue
        };
    } catch (error) {
        console.error('Error fetching balances:', error);
        return null;
    }
}

// Wallet connection logic
let connectedAccount = null;
const connectButton = document.getElementById("connectButton");
const disconnectButton = document.getElementById("disconnectButton");
const sendPaymentButton = document.getElementById("sendPaymentButton");
const paymentStatus = document.getElementById("paymentStatus");
const amountInput = document.getElementById("amountInput");
const balancesContainer = document.getElementById("balancesContainer");

connectButton.addEventListener("click", async () => {
    if (!window.ethereum) {
        paymentStatus.textContent = "❌ Please install MetaMask!";
        paymentStatus.style.display = "block";
        return;
    }
    
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        connectedAccount = accounts[0];
        
        // Update UI
        connectButton.disabled = true;
        disconnectButton.disabled = false;
        sendPaymentButton.disabled = false;
        paymentStatus.textContent = `✅ Connected: ${connectedAccount.substring(0, 6)}...${connectedAccount.substring(38)}`;
        paymentStatus.style.display = "block";
        
        // Display initial balances
        await updateBalances();
    } catch (err) {
        console.error("Connection error:", err);
        paymentStatus.textContent = `❌ Error: ${err.message}`;
        paymentStatus.style.display = "block";
    }
});

disconnectButton.addEventListener("click", () => {
    connectedAccount = null;
    connectButton.disabled = false;
    disconnectButton.disabled = true;
    sendPaymentButton.disabled = true;
    paymentStatus.textContent = "";
    paymentStatus.style.display = "none";
    balancesContainer.innerHTML = '';
});

// Balance display functionality
async function updateBalances() {
    if (!connectedAccount) return;
    
    const balances = await fetchTokenBalances(connectedAccount);
    if (!balances) return;
    
    balancesContainer.innerHTML = balances.tokens.map(token => `
        <div class="token-balance">
            <span class="token-symbol">${token.symbol}</span>
            <span class="token-amount">${parseFloat(token.formattedBalance).toFixed(4)}</span>
        </div>
    `).join('');
}

// Log balances button
document.getElementById('logBalancesBtn').addEventListener('click', async () => {
    if (!connectedAccount) {
        console.log('No wallet connected');
        return;
    }
    
    const balances = await fetchTokenBalances(connectedAccount);
    if (balances) {
        console.log('Token Balances:', balances.tokens);
        console.log('Total Value:', balances.totalValue);
    }
});

// [Keep your existing payment and other functionality]