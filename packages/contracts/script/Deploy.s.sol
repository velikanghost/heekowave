// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/HeekowavePayments.sol";
import "../src/HeekowaveWithdrawal.sol";
import "../src/MockUSDC.sol";

/**
 * @title DeployHeekowave
 * @dev Deployment script for Heekowave P2P payments platform
 * @notice Deploys core contracts: MockUSDC, Payments, and Withdrawal
 */
contract DeployHeekowave is Script {
    MockUSDC public usdc;
    HeekowavePayments public payments;
    HeekowaveWithdrawal public withdrawal;

    address public constant DELEGATION_MANAGER_MONAD_TESTNET =
        0xdb9B1e94B5b69Df7e401DDbedE43491141047dB3;

    address public delegationManagerAddress;

    struct NetworkConfig {
        string networkName;
        address deployer;
        uint256 deployerBalance;
        address delegationManager;
        bool isTestnet;
    }

    function setUp() public {
        delegationManagerAddress = DELEGATION_MANAGER_MONAD_TESTNET;
    }

    function run() external {
        NetworkConfig memory config;

        address deployer = tx.origin;

        config = NetworkConfig({
            networkName: "Monad Testnet",
            deployer: deployer,
            deployerBalance: deployer.balance,
            delegationManager: delegationManagerAddress,
            isTestnet: true
        });

        console2.log("=== Heekowave Deployment ===");
        console2.log("Chain ID:", block.chainid);
        console2.log("Deployer:", config.deployer);
        console2.log("Deployer Balance:", config.deployerBalance);
        console2.log("DelegationManager:", config.delegationManager);
        console2.log("");

        vm.startBroadcast();

        // 1. Deploy MockUSDC
        usdc = new MockUSDC(config.deployer);

        // 2. Deploy HeekowavePayments with DelegationManager
        payments = new HeekowavePayments(
            config.delegationManager,
            address(usdc),
            config.deployer
        );

        // 3. Deploy HeekowaveWithdrawal
        withdrawal = new HeekowaveWithdrawal(address(usdc), config.deployer);

        vm.stopBroadcast();

        logDeployment(config);
    }

    /**
     * @dev Logs deployment summary to console
     */
    function logDeployment(NetworkConfig memory config) internal view {
        console2.log("\n=== Deployment Summary ===");
        console2.log("Network:", config.networkName);
        console2.log("Chain ID:", block.chainid);
        console2.log("Deployer:", config.deployer);
        console2.log("");
        console2.log("Contract Addresses:");
        console2.log("  USDC Token:", address(usdc));
        console2.log("  HeekowavePayments:", address(payments));
        console2.log("  HeekowaveWithdrawal:", address(withdrawal));
        console2.log("  DelegationManager:", config.delegationManager);
    }
}
