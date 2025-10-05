// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/Counters.sol"; // Удалено в OpenZeppelin 5.x

/**
 * @title DonorBadges
 * @dev ERC-721 NFT контракт для бейджей доноров
 */
contract DonorBadges is ERC721, Ownable {
    // using Counters for Counters.Counter; // Удалено в OpenZeppelin 5.x
    
    uint256 private _tokenIds;
    
    // Типы бейджей
    enum BadgeType {
        FIRST_DONATION,    // Первая донация
        BRONZE_DONOR,      // 5 донаций
        SILVER_DONOR,      // 10 донаций
        GOLD_DONOR,        // 25 донаций
        PLASMA_MASTER,     // 10 донаций плазмы
        LIFESAVER          // 50 донаций
    }
    
    // Структура бейджа
    struct Badge {
        BadgeType badgeType;
        uint256 mintedAt;
        string metadata;
    }
    
    // Маппинги
    mapping(uint256 => Badge) public badges;
    mapping(address => mapping(BadgeType => bool)) public hasBadge;
    mapping(address => uint256[]) public donorBadges;
    
    // События
    event BadgeMinted(address indexed donor, uint256 tokenId, BadgeType badgeType);
    event BadgeAwarded(address indexed donor, BadgeType badgeType);
    
    constructor() ERC721("VeDonate Badges", "VEDONATE") Ownable(msg.sender) {}
    
    /**
     * @dev Минт бейджа донору
     * @param donor Адрес донора
     * @param badgeType Тип бейджа
     */
    function mintBadge(address donor, BadgeType badgeType) public onlyOwner {
        require(!hasBadge[donor][badgeType], "Donor already has this badge");
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        // Создаем бейдж
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
     * @dev Автоматическое начисление бейджей на основе количества донаций
     * @param donor Адрес донора
     * @param totalDonations Общее количество донаций
     * @param plasmaDonations Количество донаций плазмы
     */
    function checkAndAwardBadges(
        address donor, 
        uint256 totalDonations, 
        uint256 plasmaDonations
    ) external onlyOwner {
        // Первая донация
        if (totalDonations >= 1 && !hasBadge[donor][BadgeType.FIRST_DONATION]) {
            mintBadge(donor, BadgeType.FIRST_DONATION);
        }
        
        // Бронзовый донор
        if (totalDonations >= 5 && !hasBadge[donor][BadgeType.BRONZE_DONOR]) {
            mintBadge(donor, BadgeType.BRONZE_DONOR);
        }
        
        // Серебряный донор
        if (totalDonations >= 10 && !hasBadge[donor][BadgeType.SILVER_DONOR]) {
            mintBadge(donor, BadgeType.SILVER_DONOR);
        }
        
        // Золотой донор
        if (totalDonations >= 25 && !hasBadge[donor][BadgeType.GOLD_DONOR]) {
            mintBadge(donor, BadgeType.GOLD_DONOR);
        }
        
        // Мастер плазмы
        if (plasmaDonations >= 10 && !hasBadge[donor][BadgeType.PLASMA_MASTER]) {
            mintBadge(donor, BadgeType.PLASMA_MASTER);
        }
        
        // Спасатель жизней
        if (totalDonations >= 50 && !hasBadge[donor][BadgeType.LIFESAVER]) {
            mintBadge(donor, BadgeType.LIFESAVER);
        }
    }
    
    /**
     * @dev Получить бейджи донора
     * @param donor Адрес донора
     * @return Массив ID токенов бейджей
     */
    function getDonorBadges(address donor) external view returns (uint256[] memory) {
        return donorBadges[donor];
    }
    
    /**
     * @dev Проверить наличие бейджа у донора
     * @param donor Адрес донора
     * @param badgeType Тип бейджа
     * @return true если донор имеет бейдж
     */
    function donorHasBadge(address donor, BadgeType badgeType) external view returns (bool) {
        return hasBadge[donor][badgeType];
    }
    
    /**
     * @dev Получить метаданные бейджа
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
     * @dev URI токена для метаданных NFT
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
