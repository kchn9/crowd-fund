// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * Example of representation of any external contract that receives stacked funds
 */
contract ExternalContract {
    /// @notice Basic receive funds function
    function complete() external payable {}

    /// @notice Contract balance getter, test purposes only
    function getBalance() public view returns(uint) {
        return address(this).balance;
    }
}