let IouRootsToken = artifacts.require("./IouRootsToken.sol")

module.exports = (deployer, network, accounts) =>
  deployer.deploy(
    IouRootsToken, 
    15000,
    '0xA0279AF590d94405e20Fa9127646034D8d67D827', 
    'IOU ROOTS', 
    'IOR', 
    18
  )
