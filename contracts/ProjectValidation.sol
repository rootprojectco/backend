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
        for (uint8 i = 0; i < workers.length; i++){
            workersBalances[i] = 0;
        }
    }

}
