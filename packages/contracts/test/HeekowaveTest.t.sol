// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test, console} from "forge-std/Test.sol";
import {HeekowavePayments} from "../src/HeekowavePayments.sol";
import {HeekowaveWithdrawal} from "../src/HeekowaveWithdrawal.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract HeekowaveTest is Test {
    HeekowavePayments payments;
    HeekowaveWithdrawal withdrawal;
    MockUSDC usdc;

    address owner;
    address user1;
    address user2;
    address mockDelegationManager;
    address smartAccount1;
    address smartAccount2;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        mockDelegationManager = makeAddr("delegationManager");

        smartAccount1 = makeAddr("smartAccount1");
        smartAccount2 = makeAddr("smartAccount2");

        // Deploy contracts
        usdc = new MockUSDC(owner);
        payments = new HeekowavePayments(
            mockDelegationManager,
            address(usdc),
            owner
        );
        withdrawal = new HeekowaveWithdrawal(address(usdc), owner);

        usdc.mint(smartAccount1, 1000 * 10 ** 6);
        usdc.mint(smartAccount2, 1000 * 10 ** 6);
    }

    function testUSDCDeployment() public view {
        assertEq(usdc.name(), "USD Coin");
        assertEq(usdc.symbol(), "USDC");
        assertEq(usdc.decimals(), 6);
        assertEq(usdc.balanceOf(owner), 1000000 * 10 ** 6);
    }

    function testPaymentsDeployment() public view {
        assertEq(payments.owner(), owner);
        assertEq(payments.usdcToken(), address(usdc));
        assertEq(payments.getDelegationManager(), mockDelegationManager);
    }

    function testWithdrawalDeployment() public view {
        assertEq(withdrawal.owner(), owner);
        assertEq(withdrawal.usdcToken(), address(usdc));
        assertEq(withdrawal.processor(), owner);
    }

    function testDelegationManagerConfiguration() public view {
        address delegationManager = payments.getDelegationManager();
        assertTrue(
            delegationManager != address(0),
            "DelegationManager not set"
        );
        assertEq(
            delegationManager,
            mockDelegationManager,
            "Incorrect DelegationManager"
        );
    }

    function testWithdrawalRequest() public {
        vm.prank(smartAccount1);
        usdc.approve(address(withdrawal), 100 * 10 ** 6);

        vm.prank(smartAccount1);
        bytes32 requestId = withdrawal.requestWithdrawal(
            100 * 10 ** 6,
            "NGN",
            "1234567890"
        );

        assertTrue(requestId != bytes32(0), "Request ID should not be zero");
        assertEq(
            withdrawal.getContractBalance(),
            100 * 10 ** 6,
            "Withdrawal contract should hold escrowed USDC"
        );

        HeekowaveWithdrawal.WithdrawalRequest memory request = withdrawal
            .getWithdrawalRequest(requestId);
        assertEq(
            request.user,
            smartAccount1,
            "Request user should be smartAccount1"
        );
        assertEq(
            request.amount,
            100 * 10 ** 6,
            "Request amount should be 100 USDC"
        );
        assertEq(request.currency, "NGN", "Currency should be NGN");
        assertFalse(request.processed, "Request should not be processed yet");
    }

    function testPaymentRequest() public {
        vm.prank(smartAccount1);
        bytes32 requestId = payments.requestPayment(
            user1,
            user2,
            100 * 10 ** 6,
            address(usdc)
        );

        assertTrue(requestId != bytes32(0), "Request ID should not be zero");

        HeekowavePayments.PaymentRequest memory request = payments
            .getPaymentRequest(requestId);
        assertEq(request.from, user1, "Request from should be user1");
        assertEq(request.to, user2, "Request to should be user2");
        assertEq(
            request.amount,
            100 * 10 ** 6,
            "Request amount should be 100 USDC"
        );
        assertEq(request.token, address(usdc), "Request token should be USDC");
        assertFalse(request.fulfilled, "Request should not be fulfilled yet");
    }

    function testSendPayment() public {
        vm.prank(smartAccount1);
        usdc.approve(address(payments), 100 * 10 ** 6);

        uint256 initialBalance1 = usdc.balanceOf(smartAccount1);
        uint256 initialBalance2 = usdc.balanceOf(user2);

        vm.prank(smartAccount1);
        //payments.sendPayment(user2, 100 * 10 ** 6, address(usdc));

        assertEq(
            usdc.balanceOf(smartAccount1),
            initialBalance1 - 100 * 10 ** 6,
            "Sender balance should decrease"
        );
        assertEq(
            usdc.balanceOf(user2),
            initialBalance2 + 100 * 10 ** 6,
            "Recipient balance should increase"
        );
    }

    function testFulfillRequest() public {
        // Create payment request
        vm.prank(smartAccount1);
        bytes32 requestId = payments.requestPayment(
            user1,
            smartAccount2,
            50 * 10 ** 6,
            address(usdc)
        );

        // Approve and fulfill request from smartAccount2
        vm.prank(smartAccount2);
        usdc.approve(address(payments), 50 * 10 ** 6);

        uint256 initialBalance = usdc.balanceOf(user1);

        vm.prank(smartAccount2);
        payments.fulfillRequest(requestId);

        // Verify request is fulfilled
        HeekowavePayments.PaymentRequest memory request = payments
            .getPaymentRequest(requestId);
        assertTrue(request.fulfilled, "Request should be fulfilled");

        // Verify funds transferred
        assertEq(
            usdc.balanceOf(user1),
            initialBalance + 50 * 10 ** 6,
            "Requestor should receive funds"
        );
    }

    function testWithdrawalProcessing() public {
        // Request withdrawal
        vm.prank(smartAccount1);
        usdc.approve(address(withdrawal), 100 * 10 ** 6);

        vm.prank(smartAccount1);
        bytes32 requestId = withdrawal.requestWithdrawal(
            100 * 10 ** 6,
            "NGN",
            "1234567890"
        );

        // Process withdrawal (success case)
        vm.prank(owner); // Owner is the processor
        withdrawal.processWithdrawal(requestId, true, "Transfer successful");

        HeekowaveWithdrawal.WithdrawalRequest memory request = withdrawal
            .getWithdrawalRequest(requestId);
        assertTrue(request.processed, "Request should be processed");
        assertTrue(request.success, "Request should be successful");
        assertEq(
            request.message,
            "Transfer successful",
            "Message should match"
        );
    }

    function testWithdrawalProcessingFailure() public {
        // Request withdrawal
        vm.prank(smartAccount1);
        usdc.approve(address(withdrawal), 100 * 10 ** 6);

        uint256 initialBalance = usdc.balanceOf(smartAccount1);

        vm.prank(smartAccount1);
        bytes32 requestId = withdrawal.requestWithdrawal(
            100 * 10 ** 6,
            "NGN",
            "1234567890"
        );

        // Process withdrawal (failure case - should refund)
        vm.prank(owner);
        withdrawal.processWithdrawal(requestId, false, "Bank transfer failed");

        HeekowaveWithdrawal.WithdrawalRequest memory request = withdrawal
            .getWithdrawalRequest(requestId);
        assertTrue(request.processed, "Request should be processed");
        assertFalse(request.success, "Request should be failed");

        // Verify refund
        assertEq(
            usdc.balanceOf(smartAccount1),
            initialBalance,
            "User should be refunded on failure"
        );
    }
}
