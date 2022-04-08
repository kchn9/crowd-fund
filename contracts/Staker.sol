// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ExternalContract.sol";

/**
 * Core contract of decentralized staking app, provides basic mechanism of Ether stacking
 * @author kchn9
 */
contract Staker {
    /// @notice Event used to allow dApp frontend keep track of stake changes
    event Stake(address stakingUser, uint amount);

    /// @notice Emited when users are allowed to withdraw their funds
    event Open();

    /// @notice Keeping an eye on withdrawals
    event Withdrawal(address who, uint amount);

    /// @notice Keeps track of sent Stake to external stake-holding contract
    event StakeSent(address externalAddress, uint amount);

    /// @notice Representation of any external stake-holding contract
    ExternalContract example = new ExternalContract();

    /// @notice Amount of time the user has to stake ETH to earn 
    uint constant DEADLINE_TIME = 60 seconds;
    uint deadline = block.timestamp + DEADLINE_TIME;

    /// @notice The minimum amount of ETH that must be stacked by users to earn
    uint constant THRESHOLD = 1 ether;

    /// @notice Keep track of user balances
    mapping ( address => uint ) public balances;

    /// @notice Keep track if contract was executed already
    bool wasExecuted = false;

    /// @notice Bool allowing users to withdraw if threshold was not exceeded
    bool openForWithdraw = false;

    /// @notice Getter for current contract balance - mostly for test purposes
    function getBalance() public view returns(uint256) {
        return address(this).balance;
    }

    /**
     * @notice Getter to keep eye on how much time left before staking ends - mostly for test purposes
     */
    function getTimeLeft() public view returns(uint256) {
        if (deadline > block.timestamp) {
            return deadline - block.timestamp;
        } else {
            return 0;
        }
    }

    /**
     * @notice Stakes user funds to this contract balance
     * @dev Emits Stake event
     */
    function stake() external payable {
        require(msg.value > 0, "Staker: User is not staking any ETH");
        require(block.timestamp < deadline, "Staker: Staking phase is over already");
        balances[msg.sender] += msg.value;
        emit Stake(msg.sender, msg.value);
    }

    /**
     * @notice Checks if staking time is up, checks if treshold is exceeded - if so it send money to external contract,
     * if not it allow users to withdraw their coins. It may be called only once.
     * @dev Emits either StakeSent(address, uint) or Open() events, depends if threshold is exceeded
     */
    function execute() public {
        require(block.timestamp >= deadline, "Staker: The deadline is not over yet");
        require(!wasExecuted, "Staker: Contract has been executed already");
        if (this.getBalance() >= THRESHOLD) {
            emit StakeSent(address(example), this.getBalance());
            example.complete{ value: this.getBalance() }();
        } else {
            openForWithdraw = true;
            wasExecuted = true;
            emit Open();
        }
    }

    /**
     * @notice Allows users to withdraw their funds if staking phase is over
     * @dev Emits Withdrawal event
     */
    function withdraw() public {
        require(openForWithdraw, "Staker: Contract is not open for withdraw - staking continues");
        address payable to = payable(msg.sender);
        uint toWithdraw = balances[to];
        require(toWithdraw > 0, "Staker: No funds to withdraw");
        balances[to] -= toWithdraw;
        (bool success, ) = to.call{ value: toWithdraw }("");
        require(success, "Staker: Withdraw failed");
        emit Withdrawal(to, toWithdraw);
    }
}