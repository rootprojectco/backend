pragma solidity ^0.4.10;

import "zeppelin-solidity/contracts/token/SimpleToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

contract ProjectValidation {

    address public starter;
    address public manager;
    address public checker;
    address public exchangerContract;

    bool public projectClosed;
    bool public projectCompleted;
    bool public checkerPresence;

    uint public additionalTokenRate;
    uint public projectBalance;
    uint256  public workerRatio = 2;
    uint public amountForRoots = 0;

    SimpleToken public fundTokens;

    address[] public workers;
    mapping (address => uint) public workersBalances;
    mapping (address => bool) public signatures;

    event Singed(address who);
    event Closed();

    function ProjectValidation(
        address _manager,
        address _checker,
        address _exchangerContract,
        address[] _workers,
        address fundTokenAddress
    ){
        starter = msg.sender;
        manager = _manager;
        checker = _checker;
        exchangerContract = _exchangerContract;
        fundTokens = SimpleToken(fundTokenAddress);
        workers = _workers;
        checkerPresence = false;
        signatures[starter] = false;
        signatures[manager] = false;
        signatures[checker] = false;
        for (uint8 i = 0; i < workers.length; i++){
            workersBalances[workers[i]] = 0;
        }
    }

    modifier onlyValidator() {
        require(msg.sender == manager || msg.sender == starter || msg.sender == checker);
        _;
    }

    modifier onlyChecker(){
        require(msg.sender == checker);
        _;
    }

    function sign() onlyValidator returns (bool signed){
        if (msg.sender == checker) require(checkerPresence);
        signatures[msg.sender] = true;
        return true;
    }

    function sendTokensToWorkers() returns (uint amount){
        require(projectClosed && projectCompleted);
        for(uint8 i = 0; i < workers.length; i++){
            uint workerBalance = workersBalances[workers[i]];
            projectBalance -= workerBalance;
            assert( fundTokens.transfer(workers[i], workerBalance) );
        }
        assert( sendToRoots() );
    }

    function sendToRoots() internal onlyValidator returns (bool success){
        assert( fundTokens.transfer(exchangerContract, amountForRoots) );
        return true;
    }

    function getWorkerBalance(address worker) returns (uint balance){
        uint fundWorkerBalance = workersBalances[worker];
        balance = fundWorkerBalance * 2 / 3 * additionalTokenRate;
    }

    function completeProject() onlyValidator returns (bool success){
        require(isReadyToClose());
        projectCompleted = true;
        projectBalance = fundTokens.balanceOf(this);
    }

    function isReadyToClose() returns(bool result){
        result = (signatures[starter] && signatures[manager] && !checkerPresence) || signatures[checker] ? true : false;
        return result;
    }

    function sendTokensBack() internal returns (uint amount){
        require(projectClosed);
        assert(fundTokens.transfer(starter, fundTokens.balanceOf(this)));
    }

    function closeProject() onlyValidator returns (bool success){
        if (!signatures[starter] || !signatures[manager]){
            checkerPresence = true;
            return false;
        }else if(isReadyToClose()){
            projectClosed = true;
            return true;
        }
    }

    function changeWorkerBalance(address worker, uint amount) onlyValidator returns (bool success){
        require(amount >= 0);
        uint pureBalance = amount * workerRatio / 3;
        amountForRoots += (amount - pureBalance);
        workersBalances[worker] = pureBalance;
    }

}
