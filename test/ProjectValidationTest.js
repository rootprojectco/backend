let chai = require("chai")
let chaiAsPromised = require("chai-as-promised")
chai.use(chaiAsPromised)
chai.should()

let Token = artifacts.require("zeppelin-solidity/contracts/token/SimpleToken.sol")
let ProjectValidation = artifacts.require("./ProjectValidation.sol")

let fundToken
let project

contract('ProjectValidation', (accounts) => {

    const STARTER = accounts[0]
    const MANAGER = accounts[1]
    const CHECKER = accounts[2]
    const WORKERS = [accounts[3], accounts[4]]
    const EXCHANGER = accounts[5]
    const RATIO = 2 / 3

    function deployParams() {
        return [
            MANAGER,
            CHECKER,
            EXCHANGER,
            WORKERS,
            fundToken.address
        ]
    }

    beforeEach(async() => {
        fundToken = await Token.new()
        project = await ProjectValidation.new.apply(this, deployParams())
    })

    it("#1 should be equal to constructor params", async() => {
        let starter = await project.starter();
        starter.should.be.equal(accounts[0])
        let manager = await project.manager();
        manager.should.be.equal(MANAGER)
        let checker = await project.checker();
        checker[0].should.be.equal(CHECKER)
        let exchangerAddress = await project.exchangerContract()
        exchangerAddress.should.be.equal(EXCHANGER)
        let firstWorker = await project.workers.call(0)
        firstWorker.should.be.equal(WORKERS[0])
        let secondWorker = await project.workers.call(1)
        secondWorker.should.be.equal(WORKERS[1])
    })

    it("#2 should transfer tokens to project address", async() => {
        fundToken.transfer(project.address, 100)
        let projectBalance = await fundToken.balanceOf(project.address)
        projectBalance.toNumber().should.be.equal(100)
    })

    it("#3 should fail to set balance to worker", async() => {
        const AMOUNT = 60
        await project.changeWorkerBalance(WORKERS[0], AMOUNT, {from: WORKERS[0]}).should.be.rejected
        let workerBalance = await project.workersBalances.call(WORKERS[0])
        workerBalance.toNumber().should.be.equal(0)
    })

    it("#4 should set balance to first worker and increase balance for roots", async() => {
        const AMOUNT = 60
        let expectedRootBalance = Math.floor(AMOUNT - (AMOUNT * RATIO))
        await project.changeWorkerBalance(WORKERS[0], AMOUNT)
        let workerBalance = await project.workersBalances.call(WORKERS[0])
        workerBalance.toNumber().should.be.equal(AMOUNT * RATIO)
        let rootBalance = await project.amountForRoots()
        rootBalance.toNumber().should.be.equal(expectedRootBalance)
    })

    it("#5 should set balance to workers and increase balance for roots", async() => {
        const FIRST_WORKER_AMOUNT = 40
        const SECOND_WORKER_AMOUNT = 60
        await project.changeWorkerBalance(WORKERS[0], FIRST_WORKER_AMOUNT)
        await project.changeWorkerBalance(WORKERS[1], SECOND_WORKER_AMOUNT)
        let firstWorkerBalance = await project.workersBalances.call(WORKERS[0])
        let secondWorkerBalance = await project.workersBalances.call(WORKERS[1])
        firstWorkerBalance.toNumber().should.be.equal(Math.floor(FIRST_WORKER_AMOUNT * RATIO))
        secondWorkerBalance.toNumber().should.be.equal(Math.floor(SECOND_WORKER_AMOUNT * RATIO))
        let rootBalance = await project.amountForRoots()
        assert.equal(rootBalance.toNumber() + firstWorkerBalance.toNumber() + secondWorkerBalance.toNumber(), 100)
    })

    it("#6 should reject to sign project from non-validator address", async() => {
        await project.sign({from: WORKERS[0]}).should.be.rejected
    })

    it("#7 should sign the project", async() => {
        await project.sign({from: STARTER})
        let signature = await project.signatures(STARTER)
        signature.should.be.equal(true)
    })

    it("#8 should reject to complete project if no necessary signatures", async() => {
        await project.sign({from: STARTER})
        await project.completeProject({from: STARTER}).should.be.rejected
    })

    it("#9 should complete project", async() => {
        await project.sign({from: STARTER})
        await project.sign({from: MANAGER})
        await project.completeProject({from: STARTER})
        let completed = await project.projectCompleted.call()
        completed.should.be.equal(true)
    })

    it("#10 should try to close project without necessary signatures and call the checker", async() => {
        let checker = await project.checker()
        checker[3].should.be.equal(false)
        await project.sign({from: STARTER})
        await project.closeProject()
        let closed = await project.projectClosed.call()
        closed.should.be.equal(false)
        let checkerInfo = await project.checker()
        checkerInfo[3].should.be.equal(true)
    })

});
