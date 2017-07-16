var PensionFundRelease = artifacts.require("./PensionFundRelease.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(PensionFundRelease,
    [accounts[0]], accounts[1], 100, 23123434, 999, 100);
};
