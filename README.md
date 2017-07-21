# RootProject Contracts pre-alpha v0.1

RootProject is a crowdfunding platform for social projects powered by a crypto currency.

Website: https://rootproject.co

### Smart Contracts
Smart Contract I: ProjectValidation - validators check whether project has been successfuly completed

Under construction.

Smart Contract II: PensionFundRelease - "medium-term pension fund", which freezes funds for a custom period of time, and releases funds continously after approvals of validators.

## Specification

### Methods

**vote**
```cs
function vote(bool approve, string justification) onlyValidator returns (uint index)
```
Generates a vote for the fund to release or burn, and it's justification.
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
**getPaymentAmount**
```cs
function getPaymentAmount() constant returns (uint amount)
```
Executes payment calculation.
<br>
<br>
<br>
**balance**
```cs
function balance() constant returns (uint amount)
```
Returns current fund balance in ROOTs.
<br>
<br>
<br>
**releaseRoots**
```cs
function releaseRoots() returns (uint releasedAmount)
```
Executes fund release.
<br>
<br>
<br>
### Events

**Voted**
```cs
event Voted(bool approve, address validator, string justification)
```
Triggered when new vote is deployed.
<br>
<br>
<br>
**Released**
```cs
event Released(uint amount, address worker)
```
Triggered when fund is released.
<br>
<br>
<br>
## Requirements

### General:

* Node.js v7.6.0+
* truffle v3.2.2+
* testrpc v3.0.5+

### Requirements installation steps:

* npm install -g truffle ethereumjs-testrpc
* npm install
* truffle install

## Testing

To run the test, execute the following commands from the project's root folder:
* testrpc &> /dev/null & npm test

## Collaborators
* **[Alex Bazhanau](https://github.com/frostiq)**
* **[Anton Kraminkin](https://github.com/akraminkin)**


# License

All smart contracts are open source and distributed under the GNU GPL v.3

