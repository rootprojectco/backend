let BigNumber = require('bignumber.js');

let PricingStrategy = artifacts.require("reservation/PricingStrategy.sol")
let Reservation = artifacts.require("reservation/Reservation.sol")

module.exports = (deployer, network) => {

    let NEW_RATE_TIME, RATE1, RATE2, MINIMUM_WEI_AMOUNT

    NEW_RATE_TIME = 1508025600 // Sunday, October 15, 2017: 00:00:00 UTC
    RATE1 = 12500
    RATE2 = 11500

    if (network == 'live') {
        MINIMUM_WEI_AMOUNT = 1 // 1 wei
    }
    else {
        MINIMUM_WEI_AMOUNT = new BigNumber(web3.toWei(0.001, 'ether'))
    }

    deployer.deploy(
        PricingStrategy,
        NEW_RATE_TIME,
        RATE1,
        RATE2,
        MINIMUM_WEI_AMOUNT
    )
        .then(() => Reservation.deployed())
        .then((instance) => instance.setPricingStrategy(PricingStrategy.address))


}

