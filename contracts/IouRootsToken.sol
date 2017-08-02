pragma solidity ^0.4.1;

import 'zeppelin-solidity/contracts/token/BasicToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


contract PreICOLastWillToken is BasicToken, Ownable {

    string public name;

    string public symbol;

    // how many token units a buyer gets per wei
    uint256 public rate;

    // a minimal amount to ether we need to gather
    uint256 public softcap;

    // max we cat gather
    uint256 public hardcap;

    // total tokens sold
    uint256 public totalSupply;

    // timestamp
    uint256 public deadline;

    bool public active = true;

    address public contractOwner;

    // mapping does not support iteration,
    // so we need duplicate balance as array for return funds to investors if pre ico fails
    struct Funder {
        address addr;
        uint amount;
    }

    Funder[] balancesForReturn;

    function PreICOLastWillToken(
            uint256 _rate,
            string _name,
            string _symbol,
            uint256 _softcap,
            uint256 _hardcap,
            address _contractOwner
    ) {
        require(_rate > 0);
        rate = _rate;
        name = _name;
        symbol = _symbol;
        softcap = _softcap;
        hardcap = _hardcap;
        contractOwner = _contractOwner;
    }

    // disable transfer
    function transfer(address _to, uint _value) returns (bool) {
        require(1==0);
    }

    modifier canBuy() {
        require(active);
        _;
    }

    function finishIfNeed() {
        if (now > deadline || totalSupply > hardcap) {
            active = false;
            if (totalSupply < softcap) {
                for (uint i = 0; i < balancesForReturn.length; ++i) {
                    balancesForReturn[i].addr.transfer(balancesForReturn[i].amount);
                }
            }
            suicide(contractOwner);
        }
    }

   function () payable {
       buyTokens(msg.sender);
   }

    function buyTokens(address beneficiary) canBuy payable {
        
        finishIfNeed();

        require(beneficiary != 0x0);
        require(msg.value > 0);
        

        uint256 weiAmount = msg.value;
        uint256 tokens = weiAmount.mul(rate);

        totalSupply = totalSupply.add(tokens);
        balances[beneficiary] = balances[beneficiary].add(tokens);
        balancesForReturn.push(Funder({addr: beneficiary, amount: tokens}));
    }
}
