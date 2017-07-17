# RootProject Contracts pre-alpha v0.1

RootProject is a crowdfunding platform for social projects powered by a crypto currency.

Website: https://rootproject.co

### Smart Contracts
Smart Contract I: ProjectValidation - validators check whether project has been successfuly completed
<br>
Under construction.
<br>
Smart Contract II: PensionFundRelease - "medium-term pension fund", which freezes funds for a custom period of time, and releases funds continously after approvals of validators.
<br>
## Specification
<br>
### Methods
<br>
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
<br>
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
### Requirements
<br>
*General:*
* Node.js v7.6.0+
* truffle v3.2.2+
* testrpc v3.0.5+
<br>
*Requirements installation with npm:*
* npm install -g truffle
* npm install -g ethereumjs-testrpc
* npm install
* truffle install
* truffle test
<br>
## Testing
<br>
To run the test, execute the following commands from the project's root folder:
* npm start testrpc
* npm test
<br>
## Collaborators
* **[Alex Bazhanau](https://github.com/frostiq)**
<br>
<br>
<br>
## License
<br>
RootProject is open source and distributed under the GNU GPL v.3
<br>
