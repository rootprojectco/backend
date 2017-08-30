pragma solidity ^0.4.10;

import "zeppelin-solidity/contracts/token/SimpleToken.sol";
import "zeppelin-solidity/contracts/token/ERC20Basic.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

contract ProjectValidation {

    address public starter;
    address public manager;
    address public checker;

    bool public projectClosed;
    bool public projectCompleted;

    uint public rootsRate;
    uint public additionalTokenRate;

    ERC20Basic public fundTokens;
    ERC20Basic public roots;
    ERC20Basic public additionalTokens;

    address[] public workers;
    mapping (address => uint) public workersBalances;
    mapping (address => bool) public signatures;

    function ProjectValidation(
        address _manager,
        address _checker,
        address[] _workers,
        address fundTokenAddress,
        address rootsAddress,
        address additionalTokenAddress,
        uint _rootsRate,
        uint _additionalTokensRate
    ){
        starter = msg.sender;
        manager = _manager;
        checker = _checker;
        fundTokens = ERC20Basic(fundTokenAddress);
        roots = ERC20Basic(rootsAddress);
        additionalTokens = ERC20Basic(additionalTokenAddress);
        workers = _workers;
        signatures[starter] = false;
        signatures[manager] = false;
        signatures[checker] = false;
        for (uint8 i = 0; i < workers.length; i++){
            workersBalances[i] = 0;
        }
    }

    modifier onlyValidator() {
        require(msg.sender == manager || msg.sender == starter || msg.sender == checker);
        _;
    }

    function sign() onlyValidator returns (bool signed){
        signatures[msg.sender] = true;
    }

    function checkRole() returns (bool access){

    }

    function sendTokensToWorkers() returns (uint amount){

    }

    function sendTokensBack() returns (uint amount){

    }

    function closeProject() returns (bool success){

    }

    function changeRootsRate() returns (bool success){

    }

    function changeAdditionalTokensRate() returns (bool success){

    }

    function changeWorkerBalance() returns (bool success){

    }

}
