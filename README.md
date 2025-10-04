# `vechain-kit-homepage`

This example demonstrates how to integrate the `@vechain/vechain-kit` package into a Next.js application. It showcases how to leverage the library for VeChain ecosystem integration, providing a foundation for building robust and user-friendly decentralized applications (dApps).

## Setup

1. **Install dependencies:**

```bash
pnpm install
```

2. **Configure environment variables:**

```bash
# Copy the example environment file
cp env.example .env.local

# Edit .env.local with your actual values
# Required:
# - NEXT_PUBLIC_NETWORK_TYPE (main, test, or solo)
# - NEXT_PUBLIC_DELEGATOR_URL (for fee delegation)
# - NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID (for WalletConnect)
```

## Run

```bash
pnpm dev
```

## Available Scripts

-   `pnpm dev` - Start development server with Turbopack
-   `pnpm build` - Build for production
-   `pnpm clean` - Clean build artifacts
-   `pnpm lint` - Run ESLint
-   `pnpm type-check` - Run TypeScript type checking
-   `pnpm install:clean` - Install dependencies with frozen lockfile

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Required
NEXT_PUBLIC_NETWORK_TYPE=test  # or "main" or "solo"
NEXT_PUBLIC_DELEGATOR_URL=https://sponsor-testnet.vechain.energy/by/90
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id_here

# Optional
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token_here
```

## Troubleshooting

### Web3 Errors

If you encounter "Cannot set property ethereum" errors, this is normal when browser extensions are present. The app includes fixes for these conflicts.

### VeChainKit Configuration

Make sure all required environment variables are set. The app will use default values for development, but production requires proper configuration.

See `WEB3_TROUBLESHOOTING.md` for more details.
