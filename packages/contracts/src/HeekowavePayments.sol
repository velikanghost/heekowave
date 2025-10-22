// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IDelegationManager} from "@metamask/delegation-framework/interfaces/IDelegationManager.sol";

/**
 * @title HeekowavePayments
 * @dev Main contract for P2P payments using MetaMask Smart Accounts
 * @notice Works as an execution target for delegated transactions
 *
 * Integration Pattern:
 * 1. Users create MetaMask Smart Accounts (frontend)
 * 2. Users create delegations with spending limit caveats
 * 3. Delegates redeem delegations through DelegationManager
 * 4. DelegationManager validates and calls this contract
 * 5. This contract executes the payment
 */
contract HeekowavePayments is Ownable, ReentrancyGuard {
    // Events
    event PaymentSent(
        address indexed from,
        address indexed to,
        uint256 amount,
        address token,
        uint256 timestamp,
        bytes32 txHash
    );

    event PaymentRequested(
        address indexed from,
        address indexed to,
        uint256 amount,
        address token,
        bytes32 indexed requestId,
        uint256 timestamp
    );

    event RequestFulfilled(
        bytes32 indexed requestId,
        address indexed fulfiller,
        uint256 timestamp
    );

    // Structs
    struct PaymentRequest {
        address from;
        address to;
        uint256 amount;
        address token;
        bool fulfilled;
        uint256 createdAt;
        uint256 fulfilledAt;
    }

    // State variables
    IDelegationManager public immutable delegationManager;
    address public immutable usdcToken;

    mapping(bytes32 => PaymentRequest) public paymentRequests;
    uint256 public requestCounter;

    // Modifiers
    modifier validRequest(bytes32 requestId) {
        require(
            paymentRequests[requestId].from != address(0),
            "Request does not exist"
        );
        require(
            !paymentRequests[requestId].fulfilled,
            "Request already fulfilled"
        );
        _;
    }

    constructor(
        address _delegationManager,
        address _usdcToken,
        address _initialOwner
    ) Ownable(_initialOwner) {
        require(_delegationManager != address(0), "Invalid delegation manager");
        require(_usdcToken != address(0), "Invalid USDC token");
        delegationManager = IDelegationManager(_delegationManager);
        usdcToken = _usdcToken;
    }

    /**
     * @dev Log a payment event - called after smart account executes transfer
     * @notice This function is for tracking/indexing purposes only
     * @notice The actual token transfer is done directly by the smart account via delegation
     * @param from Sender address (smart account)
     * @param to Recipient address
     * @param amount Amount sent in USDC
     * @param token Token address (must be USDC)
     *
     * Flow:
     * 1. Frontend creates delegation with spending limit caveat
     * 2. Relayer calls DelegationManager.redeemDelegation() with USDC.transfer() as execution
     * 3. DelegationManager validates delegation and caveats
     * 4. Smart account executes USDC.transfer() directly (no approval needed)
     * 5. Optionally, this function can be called to emit tracking events
     */
    function logPayment(
        address from,
        address to,
        uint256 amount,
        address token
    ) external {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be positive");
        require(token == usdcToken, "Only USDC supported");

        // Just emit event for tracking - no actual transfer
        emit PaymentSent(from, to, amount, token, block.timestamp, bytes32(0));
    }

    /**
     * @dev Create a payment request
     * @notice Can be called directly or via delegation
     * @param from Requestor address (who will receive the payment)
     * @param to Recipient address (who should fulfill the request)
     * @param amount Amount requested in USDC
     * @param token Token address (must be USDC)
     * @return requestId The unique request identifier
     */
    function requestPayment(
        address from,
        address to,
        uint256 amount,
        address token
    ) external returns (bytes32 requestId) {
        require(from != address(0), "Invalid requestor");
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be positive");
        require(token == usdcToken, "Only USDC supported");

        requestId = keccak256(
            abi.encodePacked(
                from,
                to,
                amount,
                token,
                block.timestamp,
                requestCounter++
            )
        );

        paymentRequests[requestId] = PaymentRequest({
            from: from,
            to: to,
            amount: amount,
            token: token,
            fulfilled: false,
            createdAt: block.timestamp,
            fulfilledAt: 0
        });

        emit PaymentRequested(
            from,
            to,
            amount,
            token,
            requestId,
            block.timestamp
        );
    }

    /**
     * @dev Fulfill a payment request
     * @notice Can be called directly or via delegation redemption
     * @param requestId The request identifier
     */
    function fulfillRequest(
        bytes32 requestId
    ) external validRequest(requestId) nonReentrant {
        PaymentRequest storage request = paymentRequests[requestId];

        // Transfer tokens from fulfiller (caller) to requestor
        IERC20(request.token).transferFrom(
            msg.sender,
            request.from,
            request.amount
        );

        // Mark as fulfilled
        request.fulfilled = true;
        request.fulfilledAt = block.timestamp;

        emit RequestFulfilled(requestId, msg.sender, block.timestamp);

        // Also emit PaymentSent for consistency
        emit PaymentSent(
            msg.sender,
            request.from,
            request.amount,
            request.token,
            block.timestamp,
            bytes32(0)
        );
    }

    /**
     * @dev Get payment request details
     * @param requestId The request identifier
     * @return request The payment request struct
     */
    function getPaymentRequest(
        bytes32 requestId
    ) external view returns (PaymentRequest memory request) {
        return paymentRequests[requestId];
    }

    /**
     * @dev Get the DelegationManager address
     * @return Address of the DelegationManager contract
     */
    function getDelegationManager() external view returns (address) {
        return address(delegationManager);
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
