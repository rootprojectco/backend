let Token  = artifacts.require("zeppelin-solidity/contracts/token/SimpleToken.sol")
let ProjectValidation = artifacts.require("./ProjectValidation.sol")

module.exports = async (deployer, network, accounts) => {

    const MANAGER = accounts[1]
    const CHECKER = accounts[2]
    const WORKERS = [accounts[3], accounts[4]]
    const EXCHANGER = accounts[5]

    let fundToken = await Token.new()

    await deployer.deploy(
        ProjectValidation,
        MANAGER,
        CHECKER,
        EXCHANGER,
        WORKERS,
        fundToken.address
    )

}