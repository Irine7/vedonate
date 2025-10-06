# 🧪 VeDonate - Ready to testing!

## ✅ **Project Status: READY FOR TESTING**

All smart contracts deployed, addresses updated, test scripts ready!

## 🚀 **Quick Testing Start**

### 1. Check Contract Status

```bash
cd contracts
pnpm run check
```

### 2. Quick Test of Core Functions

```bash
pnpm run test:quick
```

### 3. Full Testing

```bash
pnpm run test:all
```

## 📋 **What is Tested:**

### ✅ **Contracts Deployed:**

- **B3TR Token**: `0x3e0d2d748f66a56b3ed4d1afbe2e63a9db2844c3`
- **Donor Badges**: `0x9575e91189e60b4e9a41f136c87d177e42296a88`
- **VeDonate**: `0x3e445638b907d942c33b904d6ea6951ac533bc34`

### ✅ **Test Scripts Ready:**

- `check-contracts.js` - check contract status
- `quick-test.js` - quick test of core functions
- `test-basic.js` - full functionality testing
- `test-edge-cases.js` - edge cases testing
- `test-badges.js` - NFT badges testing

### ✅ **Frontend Ready:**

- Contract addresses updated
- VeChain Kit configured
- UI components ready

## 🎯 **Expected Testing Results:**

### After `npm run test:quick`:

- ✅ 1 donor registered
- ✅ 1 donation added
- ✅ 10 B3TR tokens awarded
- ✅ 1 NFT badge created

### After `npm run test:basic`:

- ✅ 2 donors registered
- ✅ 2 donations added (blood + plasma)
- ✅ 25 B3TR tokens distributed
- ✅ 2 NFT badges created

### After `npm run test:edge`:

- ✅ All edge cases handled
- ✅ Errors properly blocked
- ✅ Validation works

### After `npm run test:badges`:

- ✅ 6 badge types tested
- ✅ Automatic awarding works
- ✅ Duplication prevented

## 🔧 **Setup Before Testing:**

### 1. Getting Test VET Tokens

Open https://faucet.vechain.org/ and get test tokens for the deployer address.

### 2. Mnemonic Phrase Setup (Optional)

Create `.env` file in `contracts` folder:

```env
MNEMONIC=your_testing_mnemonic_phrase
```

**Note**: Test mnemonic is already configured in hardhat.config.js.

## 📊 **Test Monitoring:**

### VeChain Explorer:

- **Testnet**: https://explore-testnet.vechain.org
- **Your Contracts**:
  - [B3TR Token](https://explore-testnet.vechain.org/accounts/0x3e0d2d748f66a56b3ed4d1afbe2e63a9db2844c3)
  - [Donor Badges](https://explore-testnet.vechain.org/accounts/0x9575e91189e60b4e9a41f136c87d177e42296a88)
  - [VeDonate](https://explore-testnet.vechain.org/accounts/0x3e445638b907d942c33b904d6ea6951ac533bc34)

### Events to Track:

- `DonorRegistered` - donor registration
- `DonationAdded` - donation addition
- `TokensRewarded` - B3TR awarding
- `BadgeMinted` - NFT badge creation

## 🚨 **Troubleshooting:**

### "Insufficient VTHO"

```bash
# Get more test tokens
open https://faucet.vechain.org/
```

### "Contract not found"

```bash
# Check contract status
npm run check
```

### "Transaction failed"

```bash
# Check VET balance
# Make sure you are using VeChain Testnet
```

## 🎉 **Ready for Demo!**

### What can be demonstrated:

1. **Donor registration** on blockchain
2. **Donation addition** with automatic rewards
3. **B3TR tokens** for donations
4. **NFT badges** for achievements
5. **Transparency** through VeChain Explorer
6. **VeWorld Wallet** integration

### Demo Commands:

```bash
# 1. Check contracts
npm run check

# 2. Quick test
npm run test:quick

# 3. Start frontend
cd ..
pnpm run dev
```

## 📞 **Support:**

If problems occur:

1. Check contract status: `npm run check`
2. Make sure you have VET tokens
3. Check connection to VeChain Testnet
4. Check console logs
