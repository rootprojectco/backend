let chai = require("chai")
let chaiAsPromised = require("chai-as-promised")
chai.use(chaiAsPromised)
chai.should()

let Token = artifacts.require("zeppelin-solidity/contracts/token/SimpleToken.sol")
let ProjectValidation = artifacts.require("./ProjectValidation.sol")

let fundToken
let project

contract('ProjectValidation', (accounts) => {

    const STAGES = {
        collectingSignatures: 0,
        checkerWork: 1,
        readyToComplete: 2,
        closing: 3,
        successfullyClosed: 4,
        unsuccessfullyClosed: 5
    }

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
        let completed = await project.projectCompleted.call()
        completed.should.be.equal(false)
    })

    it("#9 should complete project", async() => {
        await project.sign({from: STARTER})
        await project.sign({from: MANAGER})
        await project.tryToCompleteProject({from: STARTER})
        let completed = await project.projectCompleted.call()
        completed.should.be.equal(true)
    })

    it("#10 should try to close project without necessary signatures and call the checker", async() => {
        let checker = await project.checker()
        checker[3].should.be.equal(false)
        await project.sign({from: STARTER})
        await project.tryToCompleteProject()
        let closed = await project.projectClosed.call()
        closed.should.be.equal(false)
        let checkerInfo = await project.checker()
        checkerInfo[3].should.be.equal(true)
    })

    it("#11 should be right stages", async() => {
        let stage1 = await project.stage.call()
        stage1.c[0].should.be.equal(STAGES.collectingSignatures)
        await project.tryToCompleteProject({from: STARTER})
        let stage2 = await project.stage.call()
        stage2.c[0].should.be.equal(STAGES.checkerWork)
        await project.checkerSign(true, {from: CHECKER})
        let stage3 = await project.stage.call()
        stage3.c[0].should.be.equal(STAGES.readyToComplete)
        await project.tryToCompleteProject()
        let stage4 = await project.stage.call()
        stage4.c[0].should.be.equal(STAGES.closing)
        await project.closeProject()
        let stage5 = await project.stage.call()
        stage5.c[0].should.be.equal(STAGES.successfullyClosed)
    })

    it("#12 should success to complete project and distribute tokens", async() => {
        const FIRST_WORKER_AMOUNT = 40
        const SECOND_WORKER_AMOUNT = 60
        let expectedBalance1 = Math.floor(FIRST_WORKER_AMOUNT * RATIO)
        let expectedBalance2 = Math.floor(SECOND_WORKER_AMOUNT * RATIO)
        await fundToken.transfer(project.address, 100)
        await project.changeWorkerBalance(WORKERS[0], FIRST_WORKER_AMOUNT)
        await project.changeWorkerBalance(WORKERS[1], SECOND_WORKER_AMOUNT)
        await project.sign({from: STARTER})
        await project.sign({from: MANAGER})
        await project.tryToCompleteProject({from: STARTER})
        await project.closeProject({from: STARTER})
        let stage = await project.stage.call()
        stage.c[0].should.be.equal(STAGES.successfullyClosed)
        let expectedRootsBalance = await project.amountForRoots.call()
        await project.sendTokensToWorkers(0, WORKERS.length, {from: STARTER})
        let workerBalance1 = await fundToken.balanceOf(WORKERS[0])
        let workerBalance2 = await fundToken.balanceOf(WORKERS[1])
        let rootsBalance = await fundToken.balanceOf(EXCHANGER)
        let projectBalance = await fundToken.balanceOf(project.address)
        workerBalance1.toNumber().should.be.equal(expectedBalance1)
        workerBalance2.toNumber().should.be.equal(expectedBalance2)
        rootsBalance.toNumber().should.be.equal(expectedRootsBalance.toNumber())
        projectBalance.toNumber().should.be.equal(0)
    })

    it("#13 should unsuccessful to complete project and distribute tokens", async() => {
        const AMOUNT = 10000
        let starterBalance = await fundToken.balanceOf(STARTER)
        await fundToken.transfer(project.address, starterBalance.toNumber(), {from: STARTER})
        let projectBalance = await fundToken.balanceOf(project.address)
        projectBalance.toNumber().should.be.equal(AMOUNT)
        await project.sign({from: MANAGER})
        await project.tryToCompleteProject({from: STARTER})
        await project.checkerSign(false, {from: CHECKER})
        await project.tryToCompleteProject({from: CHECKER})
        await project.closeProject({from: CHECKER})
        let stage = await project.stage.call()
        stage.c[0].should.be.equal(STAGES.unsuccessfullyClosed)
        await project.sendTokensBack({from: CHECKER})
        starterBalance = await fundToken.balanceOf(STARTER)
        projectBalance = await fundToken.balanceOf(project.address)
        starterBalance.toNumber().should.be.equal(AMOUNT)
        projectBalance.toNumber().should.be.equal(0)
    })

});
