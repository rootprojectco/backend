let chai = require("chai")
let chaiAsPromised = require("chai-as-promised")
chai.use(chaiAsPromised)
chai.should()

let Token = artifacts.require("zeppelin-solidity/contracts/token/SimpleToken.sol")
let ProjectValidation = artifacts.require("./ProjectValidation.sol")

let fundToken, rootsToken, additionalToken
let project

contract('ProjectValidation', accounts => {

    const MANAGER = accounts[0]
    const CHECKER = accounts[1]
    const WORKERS = [accounts[2], accounts[3]]
    const ROOTS_RATE = 1
    const ADDITIONAL_TOKEN_RATE = 1

    function deployParams() {
        return [
            MANAGER,
            CHECKER,
            WORKERS,
            fundToken.address,
            rootsToken.address,
            additionalToken.address,
            ROOTS_RATE,
            ADDITIONAL_TOKEN_RATE
        ]
    }

    beforeEach(async() => {
        fundToken = await Token.new()
        rootsToken = await Token.new()
        additionalToken = await Token.new()
        project = await ProjectValidation.new.apply(this, deployParams())
    })

    it("#1 should sign the project", async() =>{
        let result = await project.sign.call();
        console.log(result);
        assert.equal(result, true)
    })

});
