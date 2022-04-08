// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * Core contract of decentralized staking app, provides basic mechanism of Ether stacking
 * @author kchn9
 */
contract Staker {
    /// @notice Event used to allow dApp frontend keep track of stake changes
    event Stake(address stakingUser, uint amount);

    /// @notice Amount of time the user has to stake ETH to earn 
    uint constant DEADLINE_TIME = 30 seconds;
    uint deadline = block.timestamp + DEADLINE_TIME;

    /// @notice The minimum amount of ETH that must be stacked by users to earn
    uint constant THRESHOLD = 1 ether;

    /// @notice Keep track of user balances
    mapping ( address => uint ) public balances;

    /**
     * @notice Stakes user funds to this contract balance
     * @dev Emits Stake event
     */
    function stake() external payable {
        require(msg.value > 0, "Staker: User is staking 0ETH");
        balances[msg.sender] += msg.value;
        emit Stake(msg.sender, msg.value);
    }

    /**
     * @notice Getter for current contract balance - mostly for test purposes
     */
    function getBalance() public view returns(uint256) {
        return address(this).balance;
    }

}