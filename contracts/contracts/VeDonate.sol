// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./B3TRToken.sol";
import "./DonorBadges.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VeDonate
 * @dev Main smart contract for blood donation system
 */
contract VeDonate is Ownable, ReentrancyGuard {
    
    // Donation structure
    struct Donation {
        address donor;
        uint256 timestamp;
        string donationType; // "blood" or "plasma"
        uint256 amount;      // amount in ml
        string centerId;     // donation center ID
        bool verified;       // whether donation is verified
        uint256 b3trReward;  // awarded B3TR tokens
    }
    
    // Donor structure
    struct Donor {
        address wallet;
        uint256 totalDonations;
        uint256 plasmaDonations;
        uint256 totalB3TR;
        bool isRegistered;
        uint256 lastDonation;
    }
    
    // State variables
    B3TRToken public b3trToken;
    DonorBadges public donorBadges;
    
    mapping(address => Donor) public donors;
    mapping(uint256 => Donation) public donations;
    mapping(address => uint256[]) public donorDonations;
    
    uint256 public totalDonations;
    uint256 public totalDonors;
    
    // Events
    event DonationAdded(
        address indexed donor,
        uint256 indexed donationId,
        string donationType,
        uint256 amount,
        string centerId
    );
    
    event DonorRegistered(address indexed donor);
    event DonationVerified(uint256 indexed donationId, bool verified);
    event RewardsDistributed(address indexed donor, uint256 b3trAmount);
    
    // Errors
    error DonorNotRegistered();
    error DonationAlreadyVerified();
    error InvalidDonationType();
    error InsufficientAmount();
    
    constructor(address _b3trToken, address _donorBadges) Ownable(msg.sender) {
        b3trToken = B3TRToken(_b3trToken);
        donorBadges = DonorBadges(_donorBadges);
    }
    
    /**
     * @dev Register new donor
     */
    function registerDonor() external {
        require(!donors[msg.sender].isRegistered, "Donor already registered");
        
        donors[msg.sender] = Donor({
            wallet: msg.sender,
            totalDonations: 0,
            plasmaDonations: 0,
            totalB3TR: 0,
            isRegistered: true,
            lastDonation: 0
        });
        
        totalDonors++;
        emit DonorRegistered(msg.sender);
    }
    
    /**
     * @dev Add donation (called only by contract owner after AI verification)
     * @param donor Donor address
     * @param donationType Donation type ("blood" or "plasma")
     * @param amount Amount in ml
     * @param centerId Donation center ID
     */
    function addDonation(
        address donor,
        string memory donationType,
        uint256 amount,
        string memory centerId
    ) external onlyOwner nonReentrant {
        if (!donors[donor].isRegistered) revert DonorNotRegistered();
        if (amount < 200 || amount > 500) revert InsufficientAmount();
        
        // Check donation type
        bool isPlasma = keccak256(abi.encodePacked(donationType)) == keccak256(abi.encodePacked("plasma"));
        if (!isPlasma && keccak256(abi.encodePacked(donationType)) != keccak256(abi.encodePacked("blood"))) {
            revert InvalidDonationType();
        }
        
        // Create donation
        Donation memory newDonation = Donation({
            donor: donor,
            timestamp: block.timestamp,
            donationType: donationType,
            amount: amount,
            centerId: centerId,
            verified: true,
            b3trReward: isPlasma ? 15 * 10**18 : 10 * 10**18
        });
        
        donations[totalDonations] = newDonation;
        donorDonations[donor].push(totalDonations);
        
        // Update donor statistics
        donors[donor].totalDonations++;
        if (isPlasma) {
            donors[donor].plasmaDonations++;
        }
        donors[donor].totalB3TR += newDonation.b3trReward;
        donors[donor].lastDonation = block.timestamp;
        
        totalDonations++;
        
        // Award B3TR tokens
        b3trToken.rewardDonor(donor, donationType);
        
        // Check and award badges
        donorBadges.checkAndAwardBadges(
            donor, 
            donors[donor].totalDonations, 
            donors[donor].plasmaDonations
        );
        
        emit DonationAdded(donor, totalDonations - 1, donationType, amount, centerId);
        emit RewardsDistributed(donor, newDonation.b3trReward);
    }
    
    /**
     * @dev Get donor information
     * @param donor Donor address
     */
    function getDonorInfo(address donor) external view returns (Donor memory) {
        return donors[donor];
    }
    
    /**
     * @dev Get donor donations
     * @param donor Donor address
     * @return Array of donation IDs
     */
    function getDonorDonations(address donor) external view returns (uint256[] memory) {
        return donorDonations[donor];
    }
    
    /**
     * @dev Get donation information
     * @param donationId Donation ID
     */
    function getDonationInfo(uint256 donationId) external view returns (Donation memory) {
        return donations[donationId];
    }
    
    /**
     * @dev Get global statistics
     */
    function getGlobalStats() external view returns (
        uint256 _totalDonations,
        uint256 _totalDonors,
        uint256 _totalB3TRDistributed
    ) {
        _totalDonations = totalDonations;
        _totalDonors = totalDonors;
        
        // Calculate total distributed B3TR amount
        uint256 totalB3TR = 0;
        for (uint256 i = 0; i < totalDonations; i++) {
            totalB3TR += donations[i].b3trReward;
        }
        _totalB3TRDistributed = totalB3TR;
    }
    
    /**
     * @dev Check if donor is registered
     */
    function isDonorRegistered(address donor) external view returns (bool) {
        return donors[donor].isRegistered;
    }
    
    /**
     * @dev Get donor B3TR balance
     */
    function getDonorB3TRBalance(address donor) external view returns (uint256) {
        return b3trToken.balanceOf(donor);
    }
    
    /**
     * @dev Get donor badges
     */
    function getDonorBadges(address donor) external view returns (uint256[] memory) {
        return donorBadges.getDonorBadges(donor);
    }
    
    /**
     * @dev Update token and badge addresses (owner only)
     */
    function updateTokenAddresses(address _b3trToken, address _donorBadges) external onlyOwner {
        b3trToken = B3TRToken(_b3trToken);
        donorBadges = DonorBadges(_donorBadges);
    }
}
