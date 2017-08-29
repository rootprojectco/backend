let Token  = artifacts.require("zeppelin-solidity/contracts/token/SimpleToken.sol")
let ProjectValidation = artifacts.require("./ProjectValidation.sol")

module.exports = async (deployer, network, accounts) => {

    const MANAGER = accounts[0]
    const CHECKER = accounts[1]
    const WORKERS = [accounts[2], accounts[3]]
    const ROOTS_RATE = 1
    const ADDITIONAL_TOKEN_RATE = 1

    let fundToken = await Token.new()
    let rootsToken = await Token.new()
    let additionalToken = await Token.new()

    await deployer.deploy(
        ProjectValidation,
        MANAGER,
        CHECKER,
        WORKERS,
        fundToken.address,
        rootsToken.address,
        additionalToken.address,
        ROOTS_RATE,
        ADDITIONAL_TOKEN_RATE
    )

}