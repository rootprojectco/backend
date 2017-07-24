let IouRootsToken = artifacts.require("./IouRootsToken.sol")

module.exports = (deployer, network, accounts) =>
  deployer.deploy(
    IouRootsToken,
    1,
    '0xA0279AF590d94405e20Fa9127646034D8d67D827'
    )
