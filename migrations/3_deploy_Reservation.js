let BigNumber = require('bignumber.js');

let IouRootsReservationToken = artifacts.require("reservation/IouRootsReservationToken.sol")
let PricingStrategy = artifacts.require("reservation/PricingStrategy.sol")
let Reservation = artifacts.require("reservation/Reservation.sol")

module.exports = async (deployer, network, accounts) => {
  if (true) {
    const RATE0 = 10000
    const RATE1 = 11000
    const RATE2 = 12000
    const MINIMUM_WEI_AMOUNT = 1 // 1 wei
    const THRESHOLD1 = new BigNumber(web3.toWei(50, 'ether'))
    const THRESHOLD2 = new BigNumber(web3.toWei(300, 'ether'))
    const HARD_CAP = new BigNumber(10).pow(8 + 18).mul(15) // + decimals
    const MINIMUM_FUNDING_GOAL = 1
    const WALLET = '0x6fE56527Be2AAf18347dd772fc333504B83c4447'
    const NOW = web3.eth.getBlock(web3.eth.blockNumber).timestamp
    const START = NOW
    const STOP = 1504569600 //  Tuesday, September 5, 2017 00:00:00 UTC
    
    await deployer.deploy(
      PricingStrategy,
      RATE0,
      RATE1,
      RATE2,
      MINIMUM_WEI_AMOUNT,
      THRESHOLD1,
      THRESHOLD2
    )
    await deployer.deploy(IouRootsReservationToken, 'ROOTS Reservation', 'RR', 18)
    
    await deployer.deploy(
        Reservation, 
        IouRootsReservationToken.address, 
        PricingStrategy.address,
        WALLET,
        START,
        STOP,
        HARD_CAP,
        MINIMUM_FUNDING_GOAL
      )

  }
  else {
    const RATE0 = 10000
    const RATE1 = 11000
    const RATE2 = 12000
    const MINIMUM_WEI_AMOUNT = new BigNumber(web3.toWei(0.001, 'ether'))
    const THRESHOLD1 = new BigNumber(web3.toWei(50, 'ether'))
    const THRESHOLD2 = new BigNumber(web3.toWei(300, 'ether'))
    const HARD_CAP = new BigNumber(1).pow(9 + 18) // + decimals
    const MINIMUM_FUNDING_GOAL = 100
    const WALLET = '0x001D51cDC8f4B378e136642DdB95Dfc4fF6a4B72'
    let now = web3.eth.getBlock(web3.eth.blockNumber).timestamp

    
    await deployer.deploy(
      PricingStrategy,
      RATE0,
      RATE1,
      RATE2,
      MINIMUM_WEI_AMOUNT,
      THRESHOLD1,
      THRESHOLD2
    )
    await deployer.deploy(IouRootsReservationToken, 'PRESALE ROOTS IOU', 'IOR', 18)
    await deployer.deploy(
        Reservation, 
        IouRootsReservationToken.address, 
        PricingStrategy.address,
        WALLET,
        now,
        now + 60 * 15,
        HARD_CAP,
        MINIMUM_FUNDING_GOAL
      )
  }
}

