pragma solidity ^0.4.10;

contract PensionFund {
    address[] public validators;
    address public worker;
    uint public firstPaymentPercent;
    uint public firstPaymentDate;
    uint public reccurentPaymentInterval;
    uint public reccurentPaymentPercent;

    struct Vote {
        bool isApprove;
        address validator;
        string justification;
    }

    mapping (address => uint) public voteIndex;
    Vote[] public votes;

    event Voted(bool isApprove, address validator, string justification);

    function PensionFund(
        address[] _validators,
        address _worker,
        uint _firstPaymentPercent,
        uint _firstPaymentDate,
        uint _reccurentPaymentInterval,
        uint _reccurentPaymentPercent
    ){
        assert(_firstPaymentPercent <= 100);
        assert(_reccurentPaymentPercent <= 100);

        validators = _validators;
        worker = _worker;
        firstPaymentPercent = _firstPaymentPercent;
        firstPaymentDate = _firstPaymentDate;
        reccurentPaymentInterval = _reccurentPaymentInterval;
        reccurentPaymentPercent = _reccurentPaymentPercent;

        votes.push(Vote(false, 0x0, "")); //first dummy vote
    }

    modifier onlyValidator(){
        bool isValidator = false;
        for (uint i = 0; i < validators.length; i++) {
            isValidator = isValidator || (msg.sender == validators[i]);
        }
        assert(isValidator);
        _;
    }

    function vote(bool isApprove, string justification) onlyValidator returns (uint index) {
        index = voteIndex[msg.sender];
        Vote memory vote = Vote(isApprove, msg.sender, justification);
        if(index == 0){
            index = votes.length;
            voteIndex[msg.sender] = index;
            votes.push(vote);
        }
        else{
            votes[index] = vote;
        }

        Voted(isApprove, msg.sender, justification);
    }

}