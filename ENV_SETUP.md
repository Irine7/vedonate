# 🔧 Environment Variables Setup

## Create `.env.local` file in project root

Copy the content below into `.env.local` file:

```env
# VeChain Network Configuration
NEXT_PUBLIC_NETWORK_TYPE=test

# VeChain Delegator URL (for fee payment)
NEXT_PUBLIC_DELEGATOR_URL=https://sponsor-testnet.vechain.energy/by/90

# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id_here

# Mixpanel Analytics (optional)
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token_here

# VeChain Testnet Configuration
NEXT_PUBLIC_VECHAIN_NETWORK=testnet
NEXT_PUBLIC_CHAIN_ID=100010
NEXT_PUBLIC_RPC_URL=https://rpc-testnet.vechain.energy
NEXT_PUBLIC_EXPLORER_URL=https://explore-testnet.vechain.org

# Contract Addresses (VeChain Testnet)
NEXT_PUBLIC_B3TR_TOKEN_ADDRESS=0x3e0d2d748f66a56b3ed4d1afbe2e63a9db2844c3
NEXT_PUBLIC_DONOR_BADGES_ADDRESS=0x9575e91189e60b4e9a41f136c87d177e42296a88
NEXT_PUBLIC_VEDONATE_ADDRESS=0x3e445638b907d942c33b904d6ea6951ac533bc34
```

## 📋 Required Settings

### 1. WalletConnect Project ID

- Go to https://cloud.walletconnect.com/
- Create new project
- Copy Project ID
- Replace `your_wallet_connect_project_id_here` with your Project ID

### 2. Mixpanel (optional)

- Register at https://mixpanel.com/
- Create new project
- Copy Project Token
- Replace `your_mixpanel_token_here` with your token

## 🚀 Ready!

After setting up environment variables:

1. Restart development server:

   ```bash
   npm run dev
   ```

2. Check that everything works correctly

## 🔍 Variable Check

All environment variables are used in the following files:

- `src/app/providers/VechainKitProviderWrapper.tsx` - VeChainKit configuration
- `src/lib/mixpanelClient.js` - Mixpanel analytics
- `src/lib/contracts.ts` - Contract addresses (already configured)

## ⚠️ Important

- `.env.local` file should not be committed to git (already in .gitignore)
- All variables with `NEXT_PUBLIC_` prefix are available in browser
- Without `NEXT_PUBLIC_` prefix variables are available only on server
