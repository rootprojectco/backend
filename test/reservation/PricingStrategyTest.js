let BigNumber = require('bignumber.js');

let PricingStrategy = artifacts.require("reservation/PricingStrategy.sol")

contract('PricingStrategy', (accounts) => {
    const RATE0 = 10000
    const RATE1 = 11000
    const RATE2 = 12000
    const MINIMUM_WEI_AMOUNT = new BigNumber(web3.toWei(20, 'ether'))
    const THRESHOLD1 = new BigNumber(web3.toWei(50, 'ether'))
    const THRESHOLD2 = new BigNumber(web3.toWei(300, 'ether'))

    let deployParams = [
        RATE0,
        RATE1,
        RATE2,
        MINIMUM_WEI_AMOUNT,
        THRESHOLD1,
        THRESHOLD2
    ]

    it("should return 0 if amount < MINIMUM_WEI_AMOUNT", async () => {
        let instance = await PricingStrategy.new.apply(this, deployParams)
        let amount = MINIMUM_WEI_AMOUNT.sub(1)
        let result = await instance.calculateTokenAmount(amount)
        assert(result.equals(0))
    })

    it("should return tokens by RATE0 if MINIMUM_WEI_AMOUNT <= amount < THRESHOLD1", async () => {
        let instance = await PricingStrategy.new.apply(this, deployParams)
        let amount = MINIMUM_WEI_AMOUNT
        let result = await instance.calculateTokenAmount(amount)
        assert(result.equals(amount.mul(RATE0)))
    })

    it("should return tokens by RATE1 if THRESHOLD1 <= amount < THRESHOLD2", async () => {
        let instance = await PricingStrategy.new.apply(this, deployParams)
        let amount = THRESHOLD1
        let result = await instance.calculateTokenAmount(amount)
        assert(result.equals(amount.mul(RATE1)))
    })

    it("should return tokens by RATE2 if THRESHOLD2 <= amount", async () => {
        let instance = await PricingStrategy.new.apply(this, deployParams)
        let amount = THRESHOLD2
        let result = await instance.calculateTokenAmount(amount)
        assert(result.equals(amount.mul(RATE2)))
    })

})