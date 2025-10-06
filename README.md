# 🩸 VeDonate - Decentralized Blood Donation System

[![VeChain](https://img.shields.io/badge/VeChain-Blockchain-green)](https://vechain.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://typescriptlang.org)
[![Chakra UI](https://img.shields.io/badge/Chakra%20UI-2.8-purple)](https://chakra-ui.com)

VeDonate is a decentralized platform for incentivizing blood and plasma donation, built on the VeChain blockchain. The platform motivates people to donate blood by offering B3TR tokens and NFT badges for verified donations.

## ✨ Key Features

- 🔗 **VeChain Integration** - all data stored on blockchain
- 💰 **B3TR Tokens** - rewards for donations (10 B3TR for blood, 15 B3TR for plasma)
- 🏆 **NFT Badges** - collectible achievements for donation
- 🤖 **AI Verification** - automatic verification of donation certificates
- 📱 **VeWorld Wallet** - integration with official VeChain wallet
- 🌐 **Multilingual** - support for Russian, English and other languages
- 🎨 **Modern UI** - beautiful interface with dark/light theme

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- VeWorld Wallet for testing

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Irine7/vedonate
cd vedonate
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Setup smart contracts**

```bash
pnpm run setup:contracts
```

4. **Start development server**

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⛓️ Blockchain Setup

### 1. Deploy Smart Contracts

```bash
# Compile contracts
pnpm run contracts:compile

# Deploy to VeChain Testnet
pnpm run contracts:deploy:testnet
```

### 2. Update Contract Addresses

After deployment, update the `src/lib/contracts.ts` file with the received addresses:

```typescript
export const CONTRACT_ADDRESSES = {
	B3TR_TOKEN: '0x...', // Replace with actual address
	DONOR_BADGES: '0x...', // Replace with actual address
	VEDONATE: '0x...', // Replace with actual address
};
```

Detailed blockchain setup instructions: [BLOCKCHAIN_SETUP.md](./BLOCKCHAIN_SETUP.md)

## 🏗️ Project Architecture

```
vedonate/
├── contracts/                 # VeChain Smart Contracts
│   ├── B3TRToken.sol         # ERC-20 reward token
│   ├── DonorBadges.sol       # ERC-721 NFT badges
│   ├── VeDonate.sol          # Main contract
│   └── deploy.js             # Deployment script
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── components/       # React components
│   │   │   ├── pages/        # Application pages
│   │   │   └── features/     # Feature components
│   │   └── layout.tsx        # Root layout
│   ├── hooks/                # React hooks
│   │   ├── useVeDonate.ts    # Hook for contract interaction
│   │   └── useSafeWallet.ts  # Hook for wallet interaction
│   ├── lib/                  # Utilities and configuration
│   │   └── contracts.ts      # ABI and contract addresses
│   └── types/                # TypeScript types
└── public/                   # Static files
```

## 🎯 Main Components

### VeDonateHome

Main page with donor dashboard, statistics and main actions.

### UploadCertificate

Component for uploading donation certificates with AI verification.

### DonationHistory

User donation history loaded from blockchain.

### DonorBadges

NFT badges and donor achievements.

### AIAssistant

Chatbot to help donors with recommendations.

## 🔧 API and Hooks

### useVeDonate

Main hook for blockchain interaction:

```typescript
const {
	donorInfo, // Donor information
	donorDonations, // Donation history
	donorBadges, // NFT badges
	globalStats, // Global statistics
	b3trBalance, // B3TR token balance
	registerDonor, // Donor registration
	addDonation, // Adding donation
	refreshData, // Data refresh
} = useVeDonate();
```

## 🎨 Design System

The project uses Chakra UI with a custom theme including:

- Blood-colored gradients (red/orange)
- Responsive design for mobile devices
- Dark and light themes
- Emoji icons for friendly interface

## 🌍 Multilingual Support

Language support via i18next:

- Russian (default)
- English
- Spanish
- French
- German
- Italian
- Japanese
- Chinese

## 📱 Mobile Support

- Responsive design for all devices
- Optimization for VeWorld Wallet on mobile
- PWA support with Service Worker

## 🧪 Testing

```bash
# Run linter
pnpm run lint

# Type check
pnpm run type-check

# Build project
pnpm run build
```

## 🚀 Production Deployment

1. **Configure environment variables**

```env
NEXT_PUBLIC_VECHAIN_NETWORK=mainnet
NEXT_PUBLIC_CONTRACT_ADDRESSES=...
```

2. **Build the project**

```bash
pnpm run build
```

3. **Deploy to Vercel, Netlify or another platform**

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Create Pull Request

## 📄 License

This project is licensed under MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [VeChain Foundation](https://vechain.org) for the ecosystem
- [Chakra UI](https://chakra-ui.com) for components
- [Next.js](https://nextjs.org) for the framework
- [OpenZeppelin](https://openzeppelin.com) for smart contracts

## 📞 Support

- 📧 Email: support@vedonate.org
- 💬 Discord: [VeChain Community](https://discord.gg/vechain)
- 🐦 Twitter: [@VeDonate](https://twitter.com/vedonate)
- 📖 Documentation: [docs.vedonate.org](https://docs.vedonate.org)

---

**Made with ❤️ for saving lives through blockchain technology**
