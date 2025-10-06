// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/Counters.sol"; // Removed in OpenZeppelin 5.x

/**
 * @title DonorBadges
 * @dev ERC-721 NFT contract for donor badges
 */
contract DonorBadges is ERC721, Ownable {
    // using Counters for Counters.Counter; // Removed in OpenZeppelin 5.x
    
    uint256 private _tokenIds;
    
    // Badge types
    enum BadgeType {
        FIRST_DONATION,    // First donation
        BRONZE_DONOR,      // 5 donations
        SILVER_DONOR,      // 10 donations
        GOLD_DONOR,        // 25 donations
        PLASMA_MASTER,     // 10 plasma donations
        LIFESAVER          // 50 donations
    }
    
    // Badge structure
    struct Badge {
        BadgeType badgeType;
        uint256 mintedAt;
        string metadata;
    }
    
    // Mappings
    mapping(uint256 => Badge) public badges;
    mapping(address => mapping(BadgeType => bool)) public hasBadge;
    mapping(address => uint256[]) public donorBadges;
    
    // Events
    event BadgeMinted(address indexed donor, uint256 tokenId, BadgeType badgeType);
    event BadgeAwarded(address indexed donor, BadgeType badgeType);
    
    constructor() ERC721("VeDonate Badges", "VEDONATE") Ownable(msg.sender) {}
    
    /**
     * @dev Mint badge to donor
     * @param donor Donor address
     * @param badgeType Badge type
     */
    function mintBadge(address donor, BadgeType badgeType) public onlyOwner {
        require(!hasBadge[donor][badgeType], "Donor already has this badge");
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        // Create badge
        Badge memory newBadge = Badge({
            badgeType: badgeType,
            mintedAt: block.timestamp,
            metadata: getBadgeMetadata(badgeType)
        });
        
        badges[newTokenId] = newBadge;
        hasBadge[donor][badgeType] = true;
        donorBadges[donor].push(newTokenId);
        
        _safeMint(donor, newTokenId);
        
        emit BadgeMinted(donor, newTokenId, badgeType);
        emit BadgeAwarded(donor, badgeType);
    }
    
    /**
     * @dev Automatic badge awarding based on donation count
     * @param donor Donor address
     * @param totalDonations Total donation count
     * @param plasmaDonations Plasma donation count
     */
    function checkAndAwardBadges(
        address donor, 
        uint256 totalDonations, 
        uint256 plasmaDonations
    ) external onlyOwner {
        // First donation
        if (totalDonations >= 1 && !hasBadge[donor][BadgeType.FIRST_DONATION]) {
            mintBadge(donor, BadgeType.FIRST_DONATION);
        }
        
        // Bronze donor
        if (totalDonations >= 5 && !hasBadge[donor][BadgeType.BRONZE_DONOR]) {
            mintBadge(donor, BadgeType.BRONZE_DONOR);
        }
        
        // Silver donor
        if (totalDonations >= 10 && !hasBadge[donor][BadgeType.SILVER_DONOR]) {
            mintBadge(donor, BadgeType.SILVER_DONOR);
        }
        
        // Gold donor
        if (totalDonations >= 25 && !hasBadge[donor][BadgeType.GOLD_DONOR]) {
            mintBadge(donor, BadgeType.GOLD_DONOR);
        }
        
        // Plasma master
        if (plasmaDonations >= 10 && !hasBadge[donor][BadgeType.PLASMA_MASTER]) {
            mintBadge(donor, BadgeType.PLASMA_MASTER);
        }
        
        // Lifesaver
        if (totalDonations >= 50 && !hasBadge[donor][BadgeType.LIFESAVER]) {
            mintBadge(donor, BadgeType.LIFESAVER);
        }
    }
    
    /**
     * @dev Get donor badges
     * @param donor Donor address
     * @return Array of badge token IDs
     */
    function getDonorBadges(address donor) external view returns (uint256[] memory) {
        return donorBadges[donor];
    }
    
    /**
     * @dev Check if donor has badge
     * @param donor Donor address
     * @param badgeType Badge type
     * @return true if donor has badge
     */
    function donorHasBadge(address donor, BadgeType badgeType) external view returns (bool) {
        return hasBadge[donor][badgeType];
    }
    
    /**
     * @dev Get badge metadata
     */
    function getBadgeMetadata(BadgeType badgeType) internal pure returns (string memory) {
        if (badgeType == BadgeType.FIRST_DONATION) {
            return "First Blood Donation - Your journey begins!";
        } else if (badgeType == BadgeType.BRONZE_DONOR) {
            return "Bronze Donor - 5 donations completed";
        } else if (badgeType == BadgeType.SILVER_DONOR) {
            return "Silver Donor - 10 donations completed";
        } else if (badgeType == BadgeType.GOLD_DONOR) {
            return "Gold Donor - 25 donations completed";
        } else if (badgeType == BadgeType.PLASMA_MASTER) {
            return "Plasma Master - 10 plasma donations";
        } else if (badgeType == BadgeType.LIFESAVER) {
            return "Lifesaver - 50 donations completed";
        }
        return "Unknown badge";
    }
    
    /**
     * @dev Token URI for NFT metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        Badge memory badge = badges[tokenId];
        string memory badgeName = getBadgeName(badge.badgeType);
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _encodeJson(badgeName, badge.metadata)
        ));
    }
    
    function getBadgeName(BadgeType badgeType) internal pure returns (string memory) {
        if (badgeType == BadgeType.FIRST_DONATION) return "First Donation";
        if (badgeType == BadgeType.BRONZE_DONOR) return "Bronze Donor";
        if (badgeType == BadgeType.SILVER_DONOR) return "Silver Donor";
        if (badgeType == BadgeType.GOLD_DONOR) return "Gold Donor";
        if (badgeType == BadgeType.PLASMA_MASTER) return "Plasma Master";
        if (badgeType == BadgeType.LIFESAVER) return "Lifesaver";
        return "Unknown";
    }
    
    function _encodeJson(string memory name, string memory description) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '{"name":"', name, '",',
            '"description":"', description, '",',
            '"image":"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmY2MzQ3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5GUPC90ZXh0Pjwvc3ZnPg=="}'
        ));
    }
}
