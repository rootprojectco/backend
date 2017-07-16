var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var PensionFundRelease = artifacts.require("./PensionFundRelease.sol");

contract('PensionFundRelease', function(accounts) {
  it("should return firstPaymentPercent", function() {
    return PensionFundRelease.deployed().then(function(instance) {
      return instance.firstPaymentPercent.call(accounts[0]);
    }).then(function(percent) {
      return percent.toNumber();
    }).should.eventually.equal(100);
  });
  it("should return validators", function() {
    return PensionFundRelease.deployed().then(function(instance) {
      return instance.validators.call(0);
    }).should.eventually.equal(accounts[0]) ;
  });
  
  it("should allow validators to vote", function() {
    var instance;
    return PensionFundRelease.deployed().then(function(inst) {
      instance = inst;
      return instance.vote(true, "justification", {from: accounts[0]});
    }).then(function() {
      return instance.voteIndex.call(accounts[0]);
    }).then(function(index) {
      return instance.votes.call(index);
    }).then(function(vote){
      return vote[2];
    }).should.be.eventually.equal("justification");
  });

  it("should not allow non-validators to vote", function() {
    return PensionFundRelease.deployed().then(function(inst) {
      return instance.vote(true, "justification", {from: accounts[3]});
    }).should.be.rejected;
  });
});
