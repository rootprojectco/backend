var chai = require("chai")
var chaiAsPromised = require("chai-as-promised")
chai.use(chaiAsPromised)
chai.should()

var Token = artifacts.require("zeppelin-solidity/contracts/token/SimpleToken.sol")
var PensionFundRelease = artifacts.require("./PensionFundRelease.sol")

contract('PensionFundRelease', (accounts) => {
  var validators = [accounts[0], accounts[1]]
  var worker = accounts[2]
  var unauthorized = accounts[3]

  var deployParams = token => [validators, worker, 100, 1500243470, 604800, 100, token]

  it("should return firstPaymentPercent", () =>
    PensionFundRelease.new.apply(this, deployParams('0x0'))
    .then(instance => instance.firstPaymentPercent.call())
    .then(percent => percent.toNumber())
    .should.eventually.equal(100)
  )

  it("should return validators", () =>
    PensionFundRelease.new.apply(this, deployParams('0x0'))
    .then(instance => instance.validators.call(0))
    .should.eventually.equal(validators[0])
  )
  
  it("should allow validators to vote", () => {
    var instance
    return PensionFundRelease.new.apply(this, deployParams('0x0'))
    .then(inst => { instance = inst })
    .then(() => instance.vote(true, "justification", {from: validators[0]}))
    .then(() => instance.voteIndex.call(validators[0]))
    .then(index => instance.votes.call(index))
    .then(vote => vote[2])
    .should.be.eventually.equal("justification")
  })

  it("should not allow non-validators to vote", () =>
     PensionFundRelease.new.apply(this, deployParams('0x0'))
     .then(inst => instance.vote(true, "justification", {from: unauthorized}))
     .should.be.rejected
  )

  it("should allow release after all validators approval", () => {
    var instance
    return PensionFundRelease.new.apply(this, deployParams('0x0'))
    .then(inst => { instance = inst })
    .then(() => instance.vote(true, "justification", {from: validators[0]}))
    .then(() => instance.vote(true, "justification", {from: validators[1]}))
    .then(() => instance.isReleaseApproved.call())
    .should.be.eventually.equal(true)
  })

  it("should not allow release if not all validators approved release", () => {
    var instance
    return PensionFundRelease.new.apply(this, deployParams('0x0'))
    .then(inst => { instance = inst })
    .then(() => instance.vote(true, "justification", {from: validators[0]}))
    .then(() => instance.isReleaseApproved.call())
    .should.be.eventually.equal(false)
  })

  it("should allow burn after all validators rejection", () => {
    var instance
    return PensionFundRelease.new.apply(this, deployParams('0x0'))
    .then(inst => { instance = inst})
    .then(() => instance.vote(false, "justification", {from: validators[0]}))
    .then(() => instance.vote(false, "justification", {from: validators[1]}))
    .then(() => instance.isBurnApproved.call())
    .should.be.eventually.equal(true)
  })

  it("should not allow burn if not all validators rejected release", () => {
    var instance
    return PensionFundRelease.new.apply(this, deployParams('0x0'))
    .then(inst => { instance = inst })
    .then(() => instance.vote(false, "justification", {from: validators[0]}))
    .then(() => instance.isBurnApproved.call())
    .should.be.eventually.equal(false)
  })

  it("should release roots if all conditions met", () => {
    var fund, token
    var balance = 100
    return Token.deployed()
    .then(inst => { token = inst })
    .then(() => PensionFundRelease.new.apply(this, deployParams(token.address)))
    .then(inst => { fund = inst })
    .then(() => token.transfer(fund.address, balance))
    .then(() => fund.vote(true, "justification", {from: validators[0]}))
    .then(() => fund.vote(true, "justification", {from: validators[1]}))
    .then(() => fund.releaseRoots({from: worker}))
    .then(() => fund.firtPaymentReleased.call().should.be.eventually.equal(true))
    .then(() => token.balanceOf(worker))
    .then(workerBalance => workerBalance.toNumber())
    .should.be.eventually.equal(balance)
  })
})
