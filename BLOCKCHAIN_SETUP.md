# 🩸 VeDonate - Blockchain Infrastructure Setup

## 📋 Overview

VeDonate uses VeChain blockchain for:

- ✅ Registering donations on blockchain
- ✅ Awarding B3TR tokens for donations
- ✅ Issuing NFT badges for achievements
- ✅ Transparency and verification of donations

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd contracts
npm install
```

### 2. Environment Setup

Create `.env` file in `contracts` folder:

```env
PRIVATE_KEY=your_private_key_for_deployment
VECHAIN_TESTNET_URL=https://testnet.veblocks.net
VECHAIN_MAINNET_URL=https://mainnet.veblocks.net
```

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Deploy to VeChain Testnet

```bash
npm run deploy:testnet
```

After successful deployment you will get contract addresses:

```
✅ B3TR Token deployed at address: 0x...
✅ Donor Badges deployed at address: 0x...
✅ VeDonate deployed at address: 0x...
```

### 5. Update Frontend Addresses

Update `src/lib/contracts.ts` file with received addresses:

```typescript
export const CONTRACT_ADDRESSES = {
	B3TR_TOKEN: '0x...', // Replace with actual address
	DONOR_BADGES: '0x...', // Replace with actual address
	VEDONATE: '0x...', // Replace with actual address
};
```

## 📄 Smart Contracts Structure

### B3TRToken.sol

- ERC-20 token for rewarding donors
- 10 B3TR for blood donation
- 15 B3TR for plasma donation
- Initial supply: 1,000,000 B3TR

### DonorBadges.sol

- ERC-721 NFT contract for badges
- 6 badge types: First Donation, Bronze, Silver, Gold, Plasma Master, Life Saver
- Automatic awarding based on achievements

### VeDonate.sol

- Main system contract
- Donor registration
- Adding donations
- Awarding rewards
- Managing the entire system

## 🔧 Functionality

### For Users:

1. **Donor Registration** - free registration on blockchain
2. **Certificate Upload** - photo of donation document
3. **AI Verification** - document authenticity verification
4. **Automatic Rewards** - B3TR tokens and NFT badges

### For Administrators:

1. **Adding Donations** - `addDonation()` function
2. **Reward Management** - control over B3TR and NFT
3. **Statistics** - global system statistics

## 🎯 Frontend Integration

### Hook useVeDonate

```typescript
const { donorInfo, donorDonations, donorBadges, registerDonor, addDonation } =
	useVeDonate();
```

### Main Functions:

- `registerDonor()` - register new donor
- `addDonation()` - add donation (owner only)
- `getDonorInfo()` - get donor information
- `getGlobalStats()` - global statistics

## 🔐 Security

- All critical functions protected by `onlyOwner` modifier
- Using ReentrancyGuard for attack protection
- Input data validation
- Access rights verification

## 📊 Monitoring

### VeChain Explorer

- Testnet: https://explore-testnet.vechain.org
- Mainnet: https://explore.vechain.org

### Events to Track:

- `DonorRegistered` - new donor registration
- `DonationAdded` - new donation
- `TokensRewarded` - B3TR awarding
- `BadgeMinted` - NFT badge issuance

## 🚨 Important Notes

1. **Test Tokens**: Use VeChain Testnet for development
2. **Private Keys**: Never commit private keys
3. **Gas**: VeChain uses VTHO for transaction fees
4. **Verification**: After deployment verify contracts in Explorer

## 🔄 Contract Updates

When updates are needed:

1. Deploy new version of contracts
2. Update addresses in `contracts.ts`
3. Update ABI if interface changed
4. Test integration

## 📞 Support

If problems occur:

1. Check transaction logs in Explorer
2. Ensure contract address correctness
3. Check VTHO balance for gas payment
4. Check VeWorld Wallet connection
