
let Token = artifacts.require("zeppelin-solidity/contracts/token/SimpleToken.sol")
let PensionFundRelease = artifacts.require("./PensionFundRelease.sol")

module.exports = (deployer, network, accounts) =>
  deployer.deploy(Token)
    .then(() => deployer.deploy(
      PensionFundRelease,
      [accounts[0], accounts[1]],
      accounts[2],
      accounts[4],
      100,
      1500243470,
      604800,
      100,
      Token.address
    )
  )
