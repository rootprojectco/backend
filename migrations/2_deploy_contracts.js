var PensionFund = artifacts.require("./PensionFund.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(PensionFund,
    [accounts[0]], accounts[1], 100, 23123434, 999, 100);
};
