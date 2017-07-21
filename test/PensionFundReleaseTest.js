let chai = require("chai")
let chaiAsPromised = require("chai-as-promised")
chai.use(chaiAsPromised)
chai.should()

let Token = artifacts.require("zeppelin-solidity/contracts/token/SimpleToken.sol")
let PensionFundRelease = artifacts.require("./PensionFundRelease.sol")

contract('PensionFundRelease', (accounts) => {
  let validators = [accounts[0], accounts[1]]
  let worker = accounts[2]
  let unauthorized = accounts[3]

  let deployParams = token => [validators, worker, 100, 1500243470, 604800, 100, token]

  it("should return firstPaymentPercent", async () => {
    let instance = await PensionFundRelease.new.apply(this, deployParams('0x0'))
    let percent = await instance.firstPaymentPercent.call()
    let number = await percent.toNumber()
    number.should.equal(100)
  })

  it("should return validators", async () => {
    let instance = await PensionFundRelease.new.apply(this, deployParams('0x0'))
    let validator = await instance.validators.call(0)
    validator.should.equal(validators[0])
  })

  it("should allow validators to vote", async () => {
    let instance = await PensionFundRelease.new.apply(this, deployParams('0x0'))
    await instance.vote(true, "justification", { from: validators[0] })
    let index = await instance.voteIndex.call(validators[0])
    let vote = await instance.votes.call(index)
    vote[2].should.be.equal("justification")
  })

  it("should not allow non-validators to vote", async () => {
    let instance = await PensionFundRelease.new.apply(this, deployParams('0x0'))
    let votePromise = instance.vote(true, "justification", { from: unauthorized })
    votePromise.should.be.rejected
  })

  it("should allow release after all validators approval", async () => {
    let instance = await PensionFundRelease.new.apply(this, deployParams('0x0'))
    await instance.vote(true, "justification", { from: validators[0] })
    await instance.vote(true, "justification", { from: validators[1] })
    let approval = await instance.isReleaseApproved.call()
    approval.should.be.equal(true)
  })

  it("should not allow release if not all validators approved release", async () => {
    let instance = await PensionFundRelease.new.apply(this, deployParams('0x0'))
    await instance.vote(true, "justification", { from: validators[0] })
    let vote = await instance.isReleaseApproved.call()
    vote.should.be.equal(false)
  })

  it("should allow burn after all validators rejection", async () => {
    let instance = await PensionFundRelease.new.apply(this, deployParams('0x0'))
    await instance.vote(false, "justification", { from: validators[0] })
    await instance.vote(false, "justification", { from: validators[1] })
    let approval = await instance.isBurnApproved.call()
    approval.should.be.equal(true)
  })

  it("should not allow burn if not all validators rejected release", async () => {
    let instance = await PensionFundRelease.new.apply(this, deployParams('0x0'))
    await instance.vote(false, "justification", { from: validators[0] })
    let approval = await instance.isBurnApproved.call()
    approval.should.be.equal(false)
  })

  it("should release roots if all conditions met", async () => {
    let fund, token, workerBalance, balanceNumber
    let balance = 100
    token = await Token.deployed()
    fund = await PensionFundRelease.new.apply(this, deployParams(token.address))
    await token.transfer(fund.address, balance)
    await fund.vote(true, "justification", { from: validators[0] })
    await fund.vote(true, "justification", { from: validators[1] })
    await fund.releaseRoots({ from: worker })
    await fund.firtPaymentReleased.call().should.be.eventually.equal(true)
    workerBalance = await token.balanceOf(worker)
    balanceNumber = await workerBalance.toNumber()
    balanceNumber.should.be.equal(balance)
  })
})
