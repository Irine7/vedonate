# 💰 Getting Test VET Tokens

## 🎯 **Deployer address for faucet:**

```
0xa5e7D3f660893F67aCf000f117a4dDdAD3bf8a07
```

## 📋 **Instructions:**

### 1. Open VeChain Faucet

Go to: **https://faucet.vechain.org/**

### 2. Enter Deployer Address

Copy and paste address: `0xa5e7D3f660893F67aCf000f117a4dDdAD3bf8a07`

### 3. Get Tokens

Click "Get VET" button and wait for tokens to be received

### 4. Check Balance

Open VeChain Explorer: **https://explore-testnet.vechain.org/accounts/0xa5e7D3f660893F67aCf000f117a4dDdAD3bf8a07**

## 🔍 **All Test Accounts:**

| Account  | Address                                      | Role       |
| -------- | -------------------------------------------- | ---------- |
| Deployer | `0xa5e7D3f660893F67aCf000f117a4dDdAD3bf8a07` | Runs tests |
| Donor 1  | `0x2406180BCa83983d40191Febc6d939C62152B71b` | Test donor |
| Donor 2  | `0xB381e7da548601B1CCB05C66d415b20baE40d828` | Test donor |

## 🚀 **After Getting Tokens:**

```bash
cd contracts

# Check balance
pnpm run address

# Run tests
pnpm run test:all
```

## ⚠️ **Important Notes:**

- Use **VeChain Testnet only**
- Addresses created from test mnemonic phrase
- **DO NOT USE** these addresses in mainnet
- Tokens needed only for deployer (index 0)

---

**🎉 Ready! After getting tokens you can run tests!**
