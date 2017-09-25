let BigNumber = require('bignumber.js');

let IouRootsReservationToken = artifacts.require("reservation/IouRootsReservationToken.sol")
let PricingStrategy = artifacts.require("reservation/PricingStrategy.sol")
let Reservation = artifacts.require("reservation/Reservation.sol")

module.exports = (deployer, network) => {
    if (network == 'live') {
        const NEW_RATE_TIME = 1508025600
        const RATE1 = 12500
        const RATE2 = 11500
        const MINIMUM_WEI_AMOUNT = 1 // 1 wei
        const HARD_CAP = new BigNumber(10).pow(8 + 18).mul(15) // + decimals
        const MINIMUM_FUNDING_GOAL = 1
        const WALLET = '0x6fE56527Be2AAf18347dd772fc333504B83c4447'
        const NOW = web3.eth.getBlock(web3.eth.blockNumber).timestamp
        const START = NOW
        const STOP = 1510531200 //  Monday, November 13, 2017 00:00:00 UTC

        deployer.deploy(
            PricingStrategy,
            NEW_RATE_TIME,
            RATE1,
            RATE2,
            MINIMUM_WEI_AMOUNT,
        )
            .then(() => deployer.deploy(IouRootsReservationToken, 'ROOTS Reservation', 'RR', 18))
            .then(deployer.deploy(
                Reservation,
                IouRootsReservationToken.address,
                PricingStrategy.address,
                WALLET,
                START,
                STOP,
                HARD_CAP,
                MINIMUM_FUNDING_GOAL
            ))

    }
    else {
        const NEW_RATE_TIME = 1508025600
        const RATE1 = 12500
        const RATE2 = 11500
        const MINIMUM_WEI_AMOUNT = new BigNumber(web3.toWei(0.001, 'ether'))
        const HARD_CAP = new BigNumber(1).pow(9 + 18) // + decimals
        const MINIMUM_FUNDING_GOAL = 100
        const WALLET = '0x001D51cDC8f4B378e136642DdB95Dfc4fF6a4B72'
        let now = web3.eth.getBlock(web3.eth.blockNumber).timestamp


        deployer.deploy(
            PricingStrategy,
            NEW_RATE_TIME,
            RATE1,
            RATE2,
            MINIMUM_WEI_AMOUNT,
        )
            .then(() => deployer.deploy(IouRootsReservationToken, 'PRESALE ROOTS IOU', 'IOR', 18))
            .then(() => deployer.deploy(
                Reservation,
                IouRootsReservationToken.address,
                PricingStrategy.address,
                WALLET,
                now,
                now + 60 * 15,
                HARD_CAP,
                MINIMUM_FUNDING_GOAL
            ))
    }
}

