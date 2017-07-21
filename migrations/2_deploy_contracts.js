var Token = artifacts.require("zeppelin-solidity/contracts/token/SimpleToken.sol")
var PensionFundRelease = artifacts.require("./PensionFundRelease.sol")

module.exports = (deployer, network, accounts) =>
  deployer.deploy(Token)
    .then(() => deployer.deploy(
      PensionFundRelease,
      [accounts[0], accounts[1]],
      accounts[2],
      100,
      1500243470,
      604800,
      100,
      Token.address)
    )
