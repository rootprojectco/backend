var Token = artifacts.require("zeppelin-solidity/contracts/token/BasicToken.sol");
var PensionFundRelease = artifacts.require("./PensionFundRelease.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Token).then(function(){
      deployer.deploy(PensionFundRelease,
    [accounts[0], accounts[1]], accounts[2], 100, 1500243470, 604800, 100, Token.address);
  });
};
