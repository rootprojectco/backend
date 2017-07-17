
# back-end: RootProject Smart Contracts

Rootproject is a crowdfunding platform for social projects powered by a crypto currency.

Website: https://rootproject.co

There are 2 smart contracts:

Smart Contract I: Project Validation



Smart Contract II: Medium-term "Pension Fund"

## Specification


### Methods

**PensionFundRelease**
```cs
function PensionFundRelease(

        address[] _validators,

        address _worker,

        uint _firstPaymentPercent,

        uint _firstPaymentDate,

        uint _reccurentPaymentInterval,

        uint _reccurentPaymentPercent

    )
```
Generates a pension fund release event?
<br>	
<br>
<br>
**vote**
```cs
function vote(bool approve, string justification) onlyValidator returns (uint index)
```
Generates a vote with decision and it's justification.
<br>
<br>
<br>
**isReleaseApproved**
```cs
function isReleaseApproved() constant returns (bool approved)
```
Checks if release approved by all validators.
<br>
<br>
<br>
**isBurnApproved**
```cs
function isBurnApproved() constant returns (bool approved)
```
Checks if burn approved by all validators.
<br>
<br>
<br>

### Events

**Voted**
```cs
event Voted(bool approve, address validator, string justification);
```
Triggered when new vote is deployed.
<br>
<br>
<br>


### Prerequisites
* Node.js v7.6.0+
* truffle v3.2.2+


## Collaborators
* **[Alex Bazhanau](https://github.com/frostiq)**


## License

rootProject is open source and distributed under the GNU GPL v.3
