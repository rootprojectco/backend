let IouRootsToken = artifacts.require("./IouRootsToken.sol")

module.exports = async (deployer, network, accounts) => {
  if (network == 'live') {
    await deployer.deploy(
      IouRootsToken,
      15000,
      '0x6fE56527Be2AAf18347dd772fc333504B83c4447',
      'ROOTS IOU',
      'IOR',
      18
    )
  }
  else {
    await deployer.deploy(
      IouRootsToken,
      15000,
      '0xA0279AF590d94405e20Fa9127646034D8d67D827',
      'ROOTS IOU',
      'IOR',
      18
    )
  }
}

