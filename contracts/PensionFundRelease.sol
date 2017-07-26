pragma solidity ^0.4.10;

import "zeppelin-solidity/contracts/token/SimpleToken.sol";
import "zeppelin-solidity/contracts/token/ERC20Basic.sol";

contract PensionFundRelease {
    address[] public validators;
    address public worker;
    address public master;
    uint8 public firstPaymentPercent;
    uint8 public reccurentPaymentPercent;    
    uint public paymentTime;
    uint public lastPaymentTime;
    uint public reccurentPaymentInterval;
    uint public totalPayment;
    uint public totalReleased;
    bool public firtPaymentReleased = false;
    ERC20Basic public roots;
    uint public initialFunds;


    struct Vote {
        bool approve;
        address validator;
        string justification;
    }

    mapping (address => uint) public voteIndex;
    Vote[] public votes;

    event Voted(bool approve, address validator, string justification);
    event Released(uint amount, address worker);
    event Refunded(uint amount, address master);

    function PensionFundRelease(
        address[] _validators,
        address _worker,
        address _master,
        uint8 _firstPaymentPercent,
        uint _firstPaymentTime,
        uint _reccurentPaymentInterval,
        uint8 _reccurentPaymentPercent,
        address _rootsAddress
    ){
        require(_validators.length > 0);
        require(_worker != 0x0);
        require(_master != 0x0);
        require(_firstPaymentPercent <= 100);
        require(_reccurentPaymentPercent <= 100);

        totalReleased = 0;
        validators = _validators;
        worker = _worker;
        master = _master;
        firstPaymentPercent = _firstPaymentPercent;
        paymentTime = _firstPaymentTime;
        reccurentPaymentInterval = _reccurentPaymentInterval;
        reccurentPaymentPercent = _reccurentPaymentPercent;

        roots = ERC20Basic(_rootsAddress);

        votes.push(Vote(false, 0x0, "")); //first dummy vote
    }

    //ensure that only validator can perform the action
    modifier onlyValidator(){
        bool isValidator = false;
        for (uint i = 0; i < validators.length; i++) {
            isValidator = isValidator || (msg.sender == validators[i]);
        }
        require(isValidator);
        _;
    }

    //vote for the fund release or burn
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

    // check wether validators have approved the release
    function isReleaseApproved() constant returns (bool approved){
        uint num = 0;
        for (uint i = 1; i < votes.length; i++) { //skip dummy vote
            if (votes[i].approve) num++;
        }

        return num == validators.length;
    }

    // check wether validators have decided to burn the fund
    function isBurnApproved() constant returns (bool approved){
        uint num = 0;
        for (uint i = 1; i < votes.length; i++) { //skip dummy vote
            if (!votes[i].approve) num++;
        }

        return num == validators.length;
    }


    // calculate the amount of payment
    function getPaymentAmount() constant returns (uint amount){
        if(!firtPaymentReleased) {
            firtPaymentReleased = true;
            initialFunds = balance();          
            return initialFunds * firstPaymentPercent / 100;
        }
        else{
            return initialFunds * reccurentPaymentPercent / 100;
        }
    }

    // get current fund balance in ROOTs
    function balance() constant returns (uint amount){
        return roots.balanceOf(this);
    }

    // release the fund
    function releaseRoots() returns (uint releasedAmount){
        // Confirm validators have released funds
        if( !isReleaseApproved() || now < paymentTime){
            releasedAmount = 0;
        }
        // Confirm the next payment is due to be released
        else {
            releasedAmount = getPaymentAmount();
            if(releasedAmount > balance())
                releasedAmount = balance();
            // Assumes intended interval is meant to recur regardless of claiming funds            
            paymentTime = paymentTime + reccurentPaymentInterval;
            roots.transfer(worker, releasedAmount);
        }
        Released(releasedAmount, worker);

    }

    function refundRoots() returns (uint refundAmount){
        refundAmount = 0;
        if( isBurnApproved() && now >= paymentTime){
            refundAmount = balance();
            paymentTime = paymentTime + reccurentPaymentInterval;
            roots.transfer(master, refundAmount);
        }
        Refunded(refundAmount, worker);
    }

}