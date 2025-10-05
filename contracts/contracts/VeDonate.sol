// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./B3TRToken.sol";
import "./DonorBadges.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VeDonate
 * @dev Основной смарт-контракт для системы донорства крови
 */
contract VeDonate is Ownable, ReentrancyGuard {
    
    // Структура донации
    struct Donation {
        address donor;
        uint256 timestamp;
        string donationType; // "blood" или "plasma"
        uint256 amount;      // количество в мл
        string centerId;     // ID центра сдачи
        bool verified;       // подтверждена ли донация
        uint256 b3trReward;  // начисленные B3TR токены
    }
    
    // Структура донора
    struct Donor {
        address wallet;
        uint256 totalDonations;
        uint256 plasmaDonations;
        uint256 totalB3TR;
        bool isRegistered;
        uint256 lastDonation;
    }
    
    // Переменные состояния
    B3TRToken public b3trToken;
    DonorBadges public donorBadges;
    
    mapping(address => Donor) public donors;
    mapping(uint256 => Donation) public donations;
    mapping(address => uint256[]) public donorDonations;
    
    uint256 public totalDonations;
    uint256 public totalDonors;
    
    // События
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
    
    // Ошибки
    error DonorNotRegistered();
    error DonationAlreadyVerified();
    error InvalidDonationType();
    error InsufficientAmount();
    
    constructor(address _b3trToken, address _donorBadges) Ownable(msg.sender) {
        b3trToken = B3TRToken(_b3trToken);
        donorBadges = DonorBadges(_donorBadges);
    }
    
    /**
     * @dev Регистрация нового донора
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
     * @dev Добавление донации (вызывается только владельцем контракта после AI верификации)
     * @param donor Адрес донора
     * @param donationType Тип донации ("blood" или "plasma")
     * @param amount Количество в мл
     * @param centerId ID центра сдачи
     */
    function addDonation(
        address donor,
        string memory donationType,
        uint256 amount,
        string memory centerId
    ) external onlyOwner nonReentrant {
        if (!donors[donor].isRegistered) revert DonorNotRegistered();
        if (amount < 200 || amount > 500) revert InsufficientAmount();
        
        // Проверяем тип донации
        bool isPlasma = keccak256(abi.encodePacked(donationType)) == keccak256(abi.encodePacked("plasma"));
        if (!isPlasma && keccak256(abi.encodePacked(donationType)) != keccak256(abi.encodePacked("blood"))) {
            revert InvalidDonationType();
        }
        
        // Создаем донацию
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
        
        // Обновляем статистику донора
        donors[donor].totalDonations++;
        if (isPlasma) {
            donors[donor].plasmaDonations++;
        }
        donors[donor].totalB3TR += newDonation.b3trReward;
        donors[donor].lastDonation = block.timestamp;
        
        totalDonations++;
        
        // Начисляем B3TR токены
        b3trToken.rewardDonor(donor, donationType);
        
        // Проверяем и начисляем бейджи
        donorBadges.checkAndAwardBadges(
            donor, 
            donors[donor].totalDonations, 
            donors[donor].plasmaDonations
        );
        
        emit DonationAdded(donor, totalDonations - 1, donationType, amount, centerId);
        emit RewardsDistributed(donor, newDonation.b3trReward);
    }
    
    /**
     * @dev Получить информацию о доноре
     * @param donor Адрес донора
     */
    function getDonorInfo(address donor) external view returns (Donor memory) {
        return donors[donor];
    }
    
    /**
     * @dev Получить донации донора
     * @param donor Адрес донора
     * @return Массив ID донаций
     */
    function getDonorDonations(address donor) external view returns (uint256[] memory) {
        return donorDonations[donor];
    }
    
    /**
     * @dev Получить информацию о донации
     * @param donationId ID донации
     */
    function getDonationInfo(uint256 donationId) external view returns (Donation memory) {
        return donations[donationId];
    }
    
    /**
     * @dev Получить общую статистику
     */
    function getGlobalStats() external view returns (
        uint256 _totalDonations,
        uint256 _totalDonors,
        uint256 _totalB3TRDistributed
    ) {
        _totalDonations = totalDonations;
        _totalDonors = totalDonors;
        
        // Подсчитываем общее количество распределенных B3TR
        uint256 totalB3TR = 0;
        for (uint256 i = 0; i < totalDonations; i++) {
            totalB3TR += donations[i].b3trReward;
        }
        _totalB3TRDistributed = totalB3TR;
    }
    
    /**
     * @dev Проверить, зарегистрирован ли донор
     */
    function isDonorRegistered(address donor) external view returns (bool) {
        return donors[donor].isRegistered;
    }
    
    /**
     * @dev Получить баланс B3TR донора
     */
    function getDonorB3TRBalance(address donor) external view returns (uint256) {
        return b3trToken.balanceOf(donor);
    }
    
    /**
     * @dev Получить бейджи донора
     */
    function getDonorBadges(address donor) external view returns (uint256[] memory) {
        return donorBadges.getDonorBadges(donor);
    }
    
    /**
     * @dev Обновить адреса токенов и бейджей (только владелец)
     */
    function updateTokenAddresses(address _b3trToken, address _donorBadges) external onlyOwner {
        b3trToken = B3TRToken(_b3trToken);
        donorBadges = DonorBadges(_donorBadges);
    }
}
