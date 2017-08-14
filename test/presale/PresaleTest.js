let BigNumber = require('bignumber.js');
let TestRPC = require("ethereumjs-testrpc");
let chai = require('chai');
chai.use(require("chai-as-promised"))
chai.should()

let Presale = artifacts.require("presale/Presale.sol")
let PricingStrategy = artifacts.require("presale/PricingStrategy.sol")
let Token = artifacts.require("presale/IouRootsPresaleToken.sol")

contract('Presale', (accounts) => {
    const RATE0 = 10000
    const RATE1 = 11000
    const RATE2 = 12000
    const MINIMUM_WEI_AMOUNT = new BigNumber(web3.toWei(20, 'ether'))
    const THRESHOLD1 = new BigNumber(web3.toWei(5, 'ether'))
    const THRESHOLD2 = new BigNumber(web3.toWei(30, 'ether'))
    const HARD_CAP = THRESHOLD2.mul(RATE2)
    const MINIMUM_FUNDING_GOAL = 100
    
    const WALLET = accounts[0]
    const OWNER = accounts[1]
    const INVESTOR = accounts[2]


    async function getContracts(relativeStart, relativeEnd) {
        let token = await Token.new('PRESALE ROOTS IOU', 'IOR', 18, {from : OWNER})
        let now = web3.eth.getBlock(web3.eth.blockNumber).timestamp

        let pricingStrategy = await PricingStrategy.new(
            RATE0,
            RATE1,
            RATE2,
            MINIMUM_WEI_AMOUNT,
            THRESHOLD1,
            THRESHOLD2
        )

        let presale = await Presale.new(
            token.address,
            pricingStrategy.address,
            WALLET,
            now + relativeStart,
            now + relativeEnd,
            HARD_CAP,
            MINIMUM_FUNDING_GOAL,
            {from : OWNER}
        )

        await token.transferOwnership(presale.address, {from : OWNER})

        return {presale, pricingStrategy, token};
    }

    function getWalletBalance(){
        return web3.eth.getBalance(WALLET);
    }

    it("should change endsAt with setEndsAt", async () => {
        let presale = (await getContracts(10, 100)).presale
        let endsAt1 = await presale.endsAt()
        await presale.setEndsAt(endsAt1.plus(5), {from: OWNER})
        let endsAt2 = await presale.endsAt()
        assert(endsAt2.equals(endsAt1.plus(5)))
    })

    it("should allow investors to invest in Funding state", async () => {
        let contracts = await getContracts(-10, 100)
        let startBalance = getWalletBalance()
        await contracts.presale.sendTransaction({from: INVESTOR, value: MINIMUM_WEI_AMOUNT})
        let tokenBalance = await contracts.token.balanceOf(INVESTOR)
        let calculatedTokens = await contracts.pricingStrategy.calculateTokenAmount(MINIMUM_WEI_AMOUNT)
        assert(tokenBalance.equals(calculatedTokens))
        assert(getWalletBalance().minus(startBalance).equals(MINIMUM_WEI_AMOUNT))
    })

    it("should allow earlyParticipantWhitelist to invest in PreFunding state", async () => {
        let contracts = await getContracts(10, 100)
        let startBalance = getWalletBalance()
        await contracts.presale.setEarlyParicipantWhitelist(INVESTOR, true, {from : OWNER})
        await contracts.presale.sendTransaction({from: INVESTOR, value: MINIMUM_WEI_AMOUNT})
        let tokenBalance = await contracts.token.balanceOf(INVESTOR)
        let calculatedTokens = await contracts.pricingStrategy.calculateTokenAmount(MINIMUM_WEI_AMOUNT)
        assert(tokenBalance.equals(calculatedTokens))
        assert(getWalletBalance().minus(startBalance).equals(MINIMUM_WEI_AMOUNT))
    })

    it("should not allow to buy more tokens than hardcap", async () => {
        let contracts = await getContracts(-10, 100)
        await contracts.presale.sendTransaction({from: INVESTOR, value: THRESHOLD2})
        let promise = contracts.presale.sendTransaction({from: INVESTOR, value: MINIMUM_WEI_AMOUNT})
        promise.should.be.rejected
    })

})