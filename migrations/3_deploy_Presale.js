let IouRootsPresaleToken = artifacts.require("presale/IouRootsPresaleToken.sol")
let PricingStrategy = artifacts.require("presale/PricingStrategy.sol")
let Presale = artifacts.require("presale/Presale.sol")

module.exports = async (deployer, network, accounts) => {
  if (network == 'live') {

  }
  else {
    let wallet = '0x001D51cDC8f4B378e136642DdB95Dfc4fF6a4B72'
    let now = Math.round(new Date().getTime()/1000);
    await deployer.deploy(IouRootsPresaleToken, 'ROOTS IOU', 'IOR', 18)
    await deployer.deploy(
      PricingStrategy,
      10000,
      11000,
      12000,
      10000,
      20000,
      30000
    )
    await deployer.deploy(
        Presale, 
        IouRootsPresaleToken.address, 
        PricingStrategy.address,
        wallet,
        now + 60,
        now + 600,
        100,
        1
      )
  }
}

