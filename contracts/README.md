# VeDonate Smart Contracts

Smart contracts for decentralized blood donation platform on VeChain blockchain.

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Compile Contracts

```bash
npm run compile
```

### Deploy to VeChain Testnet

```bash
npm run deploy
```

### Verify Contracts

```bash
npm run verify
```

## 📋 Available Commands

- `npm run compile` - Compile contracts
- `npm run deploy` - Deploy to VeChain Testnet
- `npm run verify` - Verify contracts in blockchain explorer
- `npm run clean` - Clean artifacts
- `npm run test:all` - Run all tests

## 🌐 Networks

Project configured to work with **VeChain Testnet**:

- **Network**: VeChain Testnet
- **RPC URL**: https://rpc-testnet.vechain.energy
- **Chain ID**: 100010
- **Explorer**: https://explore-testnet.vechain.org

## 💰 Getting Test Tokens

To get test VET tokens use:

- [VeChain Faucet](https://faucet.vechain.org/)

## 📄 Deployed Contracts

### VeChain Testnet (05.10.2025)

- **B3TR Token**: `0x3e0d2d748f66a56b3ed4d1afbe2e63a9db2844c3`
- **Donor Badges**: `0x9575e91189e60b4e9a41f136c87d177e42296a88`
- **VeDonate**: `0x3e445638b907d942c33b904d6ea6951ac533bc34`

## 🔧 Configuration

Project uses VeChain SDK Hardhat Plugin for VeChain blockchain integration.

### Main Settings:

- **Solidity**: 0.8.20
- **EVM Version**: paris
- **Optimizer**: enabled (200 runs)

## 🧪 Testing

```bash
# Quick test
npm run test:quick

# Basic tests
npm run test:basic

# Edge case tests
npm run test:edge

# Badge tests
npm run test:badges

# All tests
npm run test:all
```

## 📚 Documentation

- [VeChain Developer Docs](https://docs.vechain.org/)
- [Hardhat VeChain Plugin](https://docs.vechain.org/developer-resources/frameworks-and-ides/hardhat)
- [VeChain Testnet Explorer](https://explore-testnet.vechain.org/)
