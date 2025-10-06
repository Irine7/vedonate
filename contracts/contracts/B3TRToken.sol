// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title B3TRToken
 * @dev ERC-20 token for rewarding blood donors
 * Symbol: B3TR (Blood Token Reward)
 */
contract B3TRToken is ERC20, Ownable {
    uint256 public constant B3TR_PER_DONATION = 10 * 10**18; // 10 B3TR per donation
    uint256 public constant B3TR_PER_PLASMA = 15 * 10**18;   // 15 B3TR per plasma
    
    // Events
    event TokensRewarded(address indexed donor, uint256 amount, string donationType);
    
    constructor() ERC20("B3TR Token", "B3TR") Ownable(msg.sender) {
        // Initial supply of 1,000,000 B3TR tokens
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    /**
     * @dev Award tokens to donor
     * @param donor Donor address
     * @param donationType Donation type ("blood" or "plasma")
     */
    function rewardDonor(address donor, string memory donationType) external onlyOwner {
        uint256 reward;
        
        if (keccak256(abi.encodePacked(donationType)) == keccak256(abi.encodePacked("plasma"))) {
            reward = B3TR_PER_PLASMA;
        } else {
            reward = B3TR_PER_DONATION;
        }
        
        _mint(donor, reward);
        emit TokensRewarded(donor, reward, donationType);
    }
    
    /**
     * @dev Batch token awarding
     */
    function batchRewardDonors(
        address[] calldata donors, 
        uint256[] calldata amounts
    ) external onlyOwner {
        require(donors.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < donors.length; i++) {
            _mint(donors[i], amounts[i]);
            emit TokensRewarded(donors[i], amounts[i], "batch");
        }
    }
    
    /**
     * @dev Get donor token balance
     */
    function getDonorBalance(address donor) external view returns (uint256) {
        return balanceOf(donor);
    }
}
