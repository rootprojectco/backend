let BigNumber = require('bignumber.js');

let PricingStrategy = artifacts.require("reservation/PricingStrategy.sol")

contract('PricingStrategy', () => {
    const RATE1 = 11000
    const RATE2 = 12000
    const MINIMUM_WEI_AMOUNT = new BigNumber(web3.toWei(20, 'ether'))

    let deployParams = (newRateTime) => [
        newRateTime,
        RATE1,
        RATE2,
        MINIMUM_WEI_AMOUNT,
    ]

    it("should return 0 if amount < MINIMUM_WEI_AMOUNT", async () => {
        let now = web3.eth.getBlock(web3.eth.blockNumber).timestamp
        let instance = await PricingStrategy.new.apply(this, deployParams(now + 10000))
        let amount = MINIMUM_WEI_AMOUNT.sub(1)
        let result = await instance.calculateTokenAmount(amount)
        assert(result.equals(0))
    })

    it("should return tokens by RATE1 if now < NEW_RATE_TIME", async () => {
        let now = web3.eth.getBlock(web3.eth.blockNumber).timestamp
        let instance = await PricingStrategy.new.apply(this, deployParams(now + 10000))
        let amount = MINIMUM_WEI_AMOUNT
        let result = await instance.calculateTokenAmount(amount)
        assert(result.equals(amount.mul(RATE1)))
    })

    it("should return tokens by RATE2 if now >= NEW_RATE_TIME", async () => {
        let now = web3.eth.getBlock(web3.eth.blockNumber).timestamp
        let newRateTime = now + 10000
        let delta = newRateTime - now + 100
        web3.currentProvider.send({
            jsonrpc: '2.0',
            method: 'evm_increaseTime',
            params: [delta],
            id: new Date().getTime()
        })

        let instance = await PricingStrategy.new.apply(this, deployParams(newRateTime))
        let amount = MINIMUM_WEI_AMOUNT
        let result = await instance.calculateTokenAmount(amount)
        assert(result.equals(amount.mul(RATE2)))
    })

})