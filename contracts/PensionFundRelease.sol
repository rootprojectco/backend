pragma solidity ^0.4.10;

contract PensionFundRelease {
    address[] public validators;
    address public worker;
    uint public firstPaymentPercent;
    uint public firstPaymentDate;
    uint public reccurentPaymentInterval;
    uint public reccurentPaymentPercent;

    struct Vote {
        bool approve;
        address validator;
        string justification;
    }

    mapping (address => uint) public voteIndex;
    Vote[] public votes;

    event Voted(bool approve, address validator, string justification);

    function PensionFundRelease(
        address[] _validators,
        address _worker,
        uint _firstPaymentPercent,
        uint _firstPaymentDate,
        uint _reccurentPaymentInterval,
        uint _reccurentPaymentPercent
    ){
        assert(_validators.length > 0);
        assert(_worker != 0x0);
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

    function vote(bool approve, string justification) onlyValidator returns (uint index) {
        index = voteIndex[msg.sender];
        Vote memory vote = Vote(approve, msg.sender, justification);
        if(index == 0){
            index = votes.length;
            voteIndex[msg.sender] = index;
            votes.push(vote);
        }
        else{
            votes[index] = vote;
        }

        Voted(approve, msg.sender, justification);
    }

    function isReleaseApproved() constant returns (bool approved){
        uint num = 0;
        for (uint i = 1; i < votes.length; i++) { //skip dummy vote
            if (votes[i].approve) num++;
        }

        return num == validators.length;
    }

    function isBurnApproved() constant returns (bool approved){
        uint num = 0;
        for (uint i = 1; i < votes.length; i++) { //skip dummy vote
            if (!votes[i].approve) num++;
        }

        return num == validators.length;
    }
}