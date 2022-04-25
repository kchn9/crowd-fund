// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @notice Contract implements mechanism of crowd funding services - allows anybody create CrowdFund contract and collect money for any goal.
 * @notice Events are keeping track of current funding state. Modifiers are protecting from withdrawing funds before fundraising ends.
 * @notice When fundraising phase is over then users can withdraw their funds if goal is not reached, otherwise funds are sent to presetted receiver. 
 * @author kchn9
 */
contract CrowdFund {

    /// @notice Informs who is founder creator, who is receiver, what is the goal and deadline when fundraising ends
    event FundCreated(address creator, address receiver, uint goal, uint deadline);

    /// @notice Event emitted whenever contract receives funds
    event FundReceived(uint indexed when, address founder, uint amount);

    /// @notice Emited when founders are allowed to withdraw their funds
    event Open();

    /// @notice Keeping an eye on withdrawals
    event Withdrawal(address who, uint amount);

    /// @notice If crowd fund is fully collected and sent to receiver then event is emitted
    event CompleteFundSent(address receiverAddress, uint amount);

    /// @notice Maximum funding time accepted by contract 
    uint constant MAX_DURATION = 90 days;

    /// @notice Representation of any crowd fund receiver, it might be either contract or EOA
    address immutable _RECEIVER;

    /// @notice Amount of time that crowd fund is valid
    uint immutable _DEADLINE;

    /// @notice The minimum amount of ETH that must be collected by founders to 
    uint immutable _THRESHOLD;

    /**
     * @notice Creates new crowd funding
     * @param _duration sets time of funding
     * @param _threshold sets Wei goal of funding
     * @param _receiver address which will receive funds after successful funding
     */
    constructor(uint _duration, uint _threshold, address _receiver) {
        require(_receiver != address(0), "CrowdFund: Fundraising receiver cannot be address 0.");
        require(_duration <= MAX_DURATION, "CrowdFund: FundDuration must not exceed 90 days.");
        _THRESHOLD = _threshold;
        _DEADLINE = block.timestamp + _duration;
        _RECEIVER = _receiver;
        emit FundCreated(msg.sender, _receiver, _threshold, _DEADLINE);
    }

    /// @notice Keep track of user balances
    mapping ( address => uint ) internal _balances;

    /// @notice Keep track if contract was executed already
    bool wasExecuted = false;

    /// @notice Bool allowing users to withdraw if threshold was not exceeded
    bool openForWithdraw = false;

    /// @notice Access modifier to allow call functions only before funding is over
    modifier fundingOnly() {
        require(block.timestamp < _DEADLINE, "CrowdFund: Funding phase is over already");
        _;
    }

    /// @notice Getter for current contract balance
    function getBalance() public view returns(uint256) {
        return address(this).balance;
    }

    /**
     * @notice Getter to keep eye on how much time left before funding phase ends
     */
    function getTimeLeft() public view returns(uint256) {
        if (_DEADLINE > block.timestamp) {
            return _DEADLINE - block.timestamp;
        } else {
            return 0;
        }
    }

    /**
     * @notice Receiving incoming funds
     * @dev Emits FundReceived event
     */
    function fund() public payable fundingOnly {
        require(msg.value > 0, "CrowdFund: User has no funds deposited");
        emit FundReceived(block.timestamp, msg.sender, msg.value);
        _balances[msg.sender] += msg.value;
    }

    /**
     * @dev Fallback function for ETH that been sent directionally
     */
    receive() external payable {
        fund();
    }

    /**
     * @notice Checks if funding phase time is up and if treshold is reached - if so it send money to external contract,
     * if not it allow users to withdraw their coins. It may be called only once.
     * @dev Emits either CompleteFundSent(address, uint) or Open() events, depends if threshold is exceeded
     */
    function execute() external {
        require(block.timestamp >= _DEADLINE, "CrowdFund: The deadline is not over yet");
        require(!wasExecuted, "CrowdFund: Contract has been executed already");
        wasExecuted = true;
        if (getBalance() >= _THRESHOLD) {
            emit CompleteFundSent(address(_RECEIVER), getBalance());
            (bool success, /*data*/) = _RECEIVER.call{ value: getBalance() }("");
            require(success, "CrowdFund");
        } else {
            openForWithdraw = true;
            emit Open();
        }
        
    }

    /**
     * @notice Allows users to withdraw their funds if funding phase is over
     * @dev Emits Withdrawal event
     */
    function withdraw() external {
        require(openForWithdraw, "CrowdFund: Contract is not open for withdraw - funding continues / threshold reached");
        require(_balances[msg.sender] > 0, "CrowdFund: No funds to withdraw");

        uint toWithdraw = _balances[msg.sender];
        _balances[msg.sender] = 0;
        emit Withdrawal(msg.sender, toWithdraw);

        (bool success, /*data*/) = msg.sender.call{ value: toWithdraw }("");
        require(success, "CrowdFund: Withdraw failed");
    }
}