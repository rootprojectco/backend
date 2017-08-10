let chai = require("chai")
let chaiAsPromised = require("chai-as-promised")
chai.use(chaiAsPromised)
chai.should()

//let Token = artifacts.require("zeppelin-solidity/contracts/token/SimpleToken.sol")
let IouRootsToken = artifacts.require("./IouRootsToken.sol")


contract('IouRootsToken', (accounts) => {
    let wallet = accounts[1]
    let beneficiary = accounts[2]
    let sender = accounts[3]

    const VALUE_TO_SEND = 10000
    const RATE = 15000
    const DECIMAL = 18


    let deployParams = [
        RATE,
        wallet, 
        'IOU ROOTS', 
        'IOR', 
        DECIMAL
    ]

    it("should return firstPaymentPercent(fallback)", async () => {
        let instance = await IouRootsToken.new.apply(this, deployParams)
        await instance.sendTransaction({from: sender, value: VALUE_TO_SEND})
        let value = await instance.balanceOf(sender)
        console.log("Sender:" + sender)
        console.log("Balance: " + value)
        value.toNumber().should.be.equal(VALUE_TO_SEND * RATE)
    })

    it("should return firstPaymentPercent(non-fallback)", async () => {
        let instance = await IouRootsToken.new.apply(this, deployParams)
        await instance.buyTokens(beneficiary, {from: sender, value: VALUE_TO_SEND})
        value = await instance.balanceOf(beneficiary)
        console.log("Beneficiary:" + value)
        value.toNumber().should.be.equal(VALUE_TO_SEND * RATE)
    })

})