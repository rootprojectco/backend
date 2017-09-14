pragma solidity ^0.4.10;

import "zeppelin-solidity/contracts/token/SimpleToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";


contract ProjectValidation {

    enum Stages {
        collectingSignatures,
        checkerWork,
        readyToComplete,
        closing,
        successfullyClosed,
        unsuccessfullyClosed
    }

    struct Checker {
        address addr;
        bool signature;
        bool signed;
        bool presence;
    }

    address public starter;

    address public manager;

    Checker public checker;

    address public exchangerContract;

    bool public projectClosed;

    bool public projectCompleted;

    uint public additionalTokenRate;

    uint public projectBalance;

    uint public workerRatio = 2;

    uint public amountForRoots = 0;

    SimpleToken public fundTokens;

    address[] public workers;

    mapping (address => uint) public workersBalances;

    mapping (address => bool) public signatures;

    event Singed(address who);
    event Closed();
    event StateChanged(Stages previous, Stages current);

    Stages public stage = Stages.collectingSignatures;

    function ProjectValidation(
        address _manager,
        address _checker,
        address _exchangerContract,
        address[] _workers,
        address fundTokenAddress
    ) {
        starter = msg.sender;
        manager = _manager;
        checker = Checker(
            _checker,
            false,
            false,
            false
        );
        exchangerContract = _exchangerContract;
        fundTokens = SimpleToken(fundTokenAddress);
        workers = _workers;
        signatures[starter] = false;
        signatures[manager] = false;
        for (uint8 i = 0; i < workers.length; i++) {
            workersBalances[workers[i]] = 0;
        }
    }

    modifier onlyValidator() {
        require(msg.sender == manager || msg.sender == starter || msg.sender == checker.addr);
        _;
    }

    modifier onlyChecker(){
        require(msg.sender == checker.addr && checker.presence);
        _;
    }

    modifier atStage(Stages _stage) {
        require(stage == _stage);
        _;
    }

    function changeStateTo (Stages _stage) internal {
        StateChanged(stage, _stage);
        stage = _stage;
    }

    modifier afterExecutingGoToState(Stages _stage){
        _;
        changeStateTo(_stage);
    }

    function sign() onlyValidator atStage(Stages.collectingSignatures) returns (bool signed) {
        signatures[msg.sender] = true;
        return true;
    }

    function checkerSign(bool signature) onlyChecker atStage(Stages.checkerWork) afterExecutingGoToState(Stages.readyToComplete) {
        checker.signed = true;
        checker.signature = signature;
    }

    function checkerCall() internal {
        changeStateTo(Stages.checkerWork);
        checker.presence = true;
    }

    function getWorkerBalance(address worker) returns (uint balance) {
        uint fundWorkerBalance = workersBalances[worker];
        balance = fundWorkerBalance * 2 / 3 * additionalTokenRate;
    }

    function tryToCompleteProject() onlyValidator {
        if ( ( !signatures[starter] || !signatures[manager] ) && !checker.presence) {
            checkerCall();
        } else if ( (checker.signed && checker.signature) || (signatures[starter] && signatures[manager]) ) {
            changeStateTo(Stages.readyToComplete);
            completeProject(true);
        } else {
            changeStateTo(Stages.readyToComplete);
            completeProject(false);
        }
    }

    function completeProject(bool decision) internal atStage(Stages.readyToComplete) afterExecutingGoToState(Stages.closing) {
        projectCompleted = decision;
        projectBalance = fundTokens.balanceOf(this);
    }

    function closeProject() onlyValidator atStage(Stages.closing) {
        projectClosed = true;
        if (projectCompleted) {
            changeStateTo(Stages.successfullyClosed);
        }else {
            changeStateTo(Stages.unsuccessfullyClosed);
        }
    }

    function sendTokensToWorkers() atStage(Stages.successfullyClosed) returns (uint amount) {
        for (uint8 i = 0; i < workers.length; i++) {
            uint workerBalance = workersBalances[workers[i]];
            projectBalance -= workerBalance;
            assert(fundTokens.transfer(workers[i], workerBalance));
        }
        assert(sendToRoots());
    }

    function sendToRoots() internal onlyValidator atStage(Stages.successfullyClosed) returns (bool success) {
        assert(fundTokens.transfer(exchangerContract, amountForRoots));
        return true;
    }

    function sendTokensBack() onlyValidator atStage(Stages.unsuccessfullyClosed) returns (uint amount) {
        assert(fundTokens.transfer(starter, fundTokens.balanceOf(this)));
    }

    function changeWorkerBalance(address worker, uint amount) onlyValidator returns (bool success) {
        require(amount >= 0);
        uint pureBalance = amount * workerRatio / 3;
        amountForRoots += (amount - pureBalance);
        workersBalances[worker] = pureBalance;
    }

}
