// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * Example of representation of any external contract that receives stacked funds
 */
contract ExternalContract {
    /// @notice Event to keep eye on process completion
    event Complete(uint collectedAmount);

    /// @notice Basic receive funds function
    /// @dev Emits Complete event 
    function complete() external payable {
        emit Complete(msg.value);
    }

    /// @notice Contract balance getter, test purposes only
    function getBalance() public view returns(uint) {
        return address(this).balance;
    }
}