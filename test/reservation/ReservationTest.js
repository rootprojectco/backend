let BigNumber = require('bignumber.js');
let chai = require('chai');
chai.use(require("chai-as-promised"))
chai.should()

let Reservation = artifacts.require("reservation/Reservation.sol")
let PricingStrategy = artifacts.require("reservation/PricingStrategy.sol")
let Token = artifacts.require("reservation/IouRootsReservationToken.sol")

contract('Reservation', (accounts) => {
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

        let reservation = await Reservation.new(
            token.address,
            pricingStrategy.address,
            WALLET,
            now + relativeStart,
            now + relativeEnd,
            HARD_CAP,
            MINIMUM_FUNDING_GOAL,
            {from : OWNER}
        )

        await token.transferOwnership(reservation.address, {from : OWNER})

        return {reservation, pricingStrategy, token};
    }

    function getWalletBalance(){
        return web3.eth.getBalance(WALLET);
    }

    it("should change endsAt with setEndsAt", async () => {
        let reservation = (await getContracts(10, 100)).reservation
        let endsAt1 = await reservation.endsAt()
        await reservation.setEndsAt(endsAt1.plus(5), {from: OWNER})
        let endsAt2 = await reservation.endsAt()
        assert(endsAt2.equals(endsAt1.plus(5)))
    })

    it("should allow investors to invest in Funding state", async () => {
        let contracts = await getContracts(-10, 100)
        let startBalance = getWalletBalance()
        await contracts.reservation.sendTransaction({from: INVESTOR, value: MINIMUM_WEI_AMOUNT})
        let tokenBalance = await contracts.token.balanceOf(INVESTOR)
        let calculatedTokens = await contracts.pricingStrategy.calculateTokenAmount(MINIMUM_WEI_AMOUNT)
        assert(tokenBalance.equals(calculatedTokens))
        assert(getWalletBalance().minus(startBalance).equals(MINIMUM_WEI_AMOUNT))
    })

    it("should allow earlyParticipantWhitelist to invest in PreFunding state", async () => {
        let contracts = await getContracts(10, 100)
        let startBalance = getWalletBalance()
        await contracts.reservation.setEarlyParicipantWhitelist(INVESTOR, true, {from : OWNER})
        await contracts.reservation.sendTransaction({from: INVESTOR, value: MINIMUM_WEI_AMOUNT})
        let tokenBalance = await contracts.token.balanceOf(INVESTOR)
        let calculatedTokens = await contracts.pricingStrategy.calculateTokenAmount(MINIMUM_WEI_AMOUNT)
        assert(tokenBalance.equals(calculatedTokens))
        assert(getWalletBalance().minus(startBalance).equals(MINIMUM_WEI_AMOUNT))
    })

    it("should not allow to buy more tokens than hardcap", async () => {
        let contracts = await getContracts(-10, 100)
        await contracts.reservation.sendTransaction({from: INVESTOR, value: THRESHOLD2})
        let promise = contracts.reservation.sendTransaction({from: INVESTOR, value: MINIMUM_WEI_AMOUNT})
        promise.should.be.rejected
    })

})