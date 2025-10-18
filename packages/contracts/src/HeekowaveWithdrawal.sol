// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title HeekowaveWithdrawal
 * @dev Contract for handling fiat withdrawal requests
 * @notice Works as an execution target for delegated transactions
 * Simulates off-ramp processing for hackathon demo
 *
 * Integration Pattern:
 * 1. Users create MetaMask Smart Accounts (frontend)
 * 2. Users create delegations for withdrawal operations
 * 3. Withdrawals can be executed directly or via delegation
 * 4. Backend processor handles fiat transfer completion
 */
contract HeekowaveWithdrawal is Ownable, ReentrancyGuard {
    // Events
    event WithdrawalRequested(
        address indexed user,
        uint256 amount,
        string currency,
        string bankDetails,
        bytes32 indexed requestId,
        uint256 timestamp
    );

    event WithdrawalCompleted(
        bytes32 indexed requestId,
        bool success,
        string message,
        uint256 timestamp
    );

    // Structs
    struct WithdrawalRequest {
        address user;
        uint256 amount;
        string currency;
        string bankDetails;
        bool processed;
        bool success;
        string message;
        uint256 createdAt;
        uint256 processedAt;
    }

    // State variables
    address public immutable usdcToken;
    address public processor; // Backend processor address

    mapping(bytes32 => WithdrawalRequest) public withdrawalRequests;
    uint256 public requestCounter;

    // Modifiers
    modifier onlyProcessor() {
        require(msg.sender == processor, "Only processor");
        _;
    }

    constructor(
        address _usdcToken,
        address _initialOwner
    ) Ownable(_initialOwner) {
        require(_usdcToken != address(0), "Invalid USDC token");
        usdcToken = _usdcToken;
        processor = _initialOwner; // Initially set to owner, can be changed
    }

    /**
     * @dev Set the processor address
     * @param _processor The new processor address
     */
    function setProcessor(address _processor) external onlyOwner {
        require(_processor != address(0), "Invalid processor");
        processor = _processor;
    }

    /**
     * @dev Request a withdrawal to fiat
     * @notice Can be called directly or via delegation redemption
     * @param amount Amount in USDC to withdraw
     * @param currency Target fiat currency (e.g., "NGN", "USD")
     * @param bankDetails Bank account details (encrypted/hashed)
     * @return requestId The unique request identifier
     *
     * Flow:
     * 1. User (or delegate) calls this function
     * 2. USDC is transferred to contract as escrow
     * 3. Backend processor handles fiat transfer
     * 4. On success, USDC stays in contract
     * 5. On failure, USDC is refunded to user
     */
    function requestWithdrawal(
        uint256 amount,
        string calldata currency,
        string calldata bankDetails
    ) external nonReentrant returns (bytes32 requestId) {
        require(amount > 0, "Amount must be positive");
        require(bytes(currency).length > 0, "Currency required");
        require(bytes(bankDetails).length > 0, "Bank details required");

        // Check caller has sufficient balance
        require(
            IERC20(usdcToken).balanceOf(msg.sender) >= amount,
            "Insufficient balance"
        );

        // Transfer USDC to contract (escrow)
        IERC20(usdcToken).transferFrom(msg.sender, address(this), amount);

        requestId = keccak256(
            abi.encodePacked(
                msg.sender,
                amount,
                currency,
                bankDetails,
                block.timestamp,
                requestCounter++
            )
        );

        withdrawalRequests[requestId] = WithdrawalRequest({
            user: msg.sender,
            amount: amount,
            currency: currency,
            bankDetails: bankDetails,
            processed: false,
            success: false,
            message: "",
            createdAt: block.timestamp,
            processedAt: 0
        });

        emit WithdrawalRequested(
            msg.sender,
            amount,
            currency,
            bankDetails,
            requestId,
            block.timestamp
        );
    }

    /**
     * @dev Process a withdrawal request (called by backend processor)
     * @param requestId The request identifier
     * @param success Whether the withdrawal was successful
     * @param message Status message
     */
    function processWithdrawal(
        bytes32 requestId,
        bool success,
        string calldata message
    ) external onlyProcessor {
        WithdrawalRequest storage request = withdrawalRequests[requestId];
        require(request.user != address(0), "Request does not exist");
        require(!request.processed, "Request already processed");

        request.processed = true;
        request.success = success;
        request.message = message;
        request.processedAt = block.timestamp;

        if (success) {
            // Keep USDC in contract (simulating fiat transfer)
            // In real implementation, this would trigger actual fiat transfer
        } else {
            // Refund USDC to user
            IERC20(usdcToken).transfer(request.user, request.amount);
        }

        emit WithdrawalCompleted(requestId, success, message, block.timestamp);
    }

    /**
     * @dev Get withdrawal request details
     * @param requestId The request identifier
     * @return request The withdrawal request struct
     */
    function getWithdrawalRequest(
        bytes32 requestId
    ) external view returns (WithdrawalRequest memory request) {
        return withdrawalRequests[requestId];
    }

    /**
     * @dev Get contract USDC balance
     * @return balance The contract's USDC balance
     */
    function getContractBalance() external view returns (uint256 balance) {
        return IERC20(usdcToken).balanceOf(address(this));
    }

    /**
     * @dev Emergency function to withdraw stuck tokens (owner only)
     * @param token Token address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}
