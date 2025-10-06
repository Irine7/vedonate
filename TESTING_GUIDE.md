# 🧪 VeDonate Smart Contracts Testing Guide

## 📋 Prerequisites

### Tools:

- ✅ VeWorld Wallet (installed in browser)
- ✅ Test VET tokens (for gas fees)
- ✅ Node.js 18+
- ✅ Git

### Preparation:

1. **Install VeWorld Wallet**: https://www.veworld.net/
2. **Get test VET**: https://faucet.vecha.in/
3. **Switch to VeChain Testnet** in wallet

## 🔧 Step 1: Deploy Contracts

### Install Dependencies

```bash
cd contracts
npm install
```

### Setup Private Key

Create `.env` file in `contracts` folder:

```env
PRIVATE_KEY=your_private_key_for_deployment
```

**⚠️ Important**: Use test wallet, NOT main wallet!

### Deploy to Testnet

```bash
npm run deploy:testnet
```

After successful deployment you will get:

```
✅ B3TR Token deployed at address: 0x...
✅ Donor Badges deployed at address: 0x...
✅ VeDonate deployed at address: 0x...
```

## 🔗 Step 2: Update Frontend Addresses

Update file `src/lib/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
	B3TR_TOKEN: '0x...', // Replace with actual address
	DONOR_BADGES: '0x...', // Replace with actual address
	VEDONATE: '0x...', // Replace with actual address
};
```

## 🧪 Step 3: Testing via Frontend

### Start Application

```bash
pnpm run dev
```

### Test Scenarios:

#### 3.1 Wallet Connection

1. Open http://localhost:3000
2. Click "Connect VeWorld Wallet"
3. Select account in wallet
4. Confirm connection

**✅ Expected Result**: Wallet connected, address displayed

#### 3.2 Donor Registration

1. Click "🔗 Register as donor"
2. Confirm transaction in wallet
3. Wait for confirmation

**✅ Expected Result**:

- Transaction successful
- Status "Registered"
- Donor dashboard appeared

#### 3.3 Upload Donation Certificate

1. Select donation type (blood/plasma)
2. Specify amount in ml
3. Select donation center
4. Upload any image (for testing)
5. Click "Upload and record in blockchain"

**✅ Expected Result**:

- Upload progress bar
- AI "analysis" of document
- Recording in blockchain
- Receiving B3TR tokens

#### 3.4 Check Rewards

After adding donation check:

- **B3TR tokens**: +10 for blood, +15 for plasma
- **NFT badge**: "First Donation" should appear
- **Donation history**: record in list

## 🔍 Step 4: Check in VeChain Explorer

### View Transactions

1. Open https://explore-testnet.vechain.org
2. Paste your wallet address
3. Find transactions:
   - `registerDonor`
   - `addDonation`
   - `rewardDonor`

### View Events

In each transaction find events:

- `DonorRegistered`
- `DonationAdded`
- `TokensRewarded`
- `BadgeMinted`

## 🧪 Step 5: Testing via Browser Console

### Check Contract State

Open DevTools (F12) and execute:

```javascript
// Get donor information
const donorInfo = await window.vechainKit.connection.thor
	.account('0x...VEDONATE_ADDRESS')
	.read([
		{
			abi: VEDONATE_ABI,
			method: 'getDonorInfo',
			args: ['YOUR_ADDRESS'],
		},
	]);

console.log('Donor Info:', donorInfo[0]);
```

### Check B3TR Balance

```javascript
const balance = await window.vechainKit.connection.thor
	.account('0x...B3TR_ADDRESS')
	.read([
		{
			abi: B3TR_TOKEN_ABI,
			method: 'balanceOf',
			args: ['YOUR_ADDRESS'],
		},
	]);

console.log('B3TR Balance:', Number(balance[0]) / 1e18);
```

## 🔧 Step 6: Testing via Hardhat

### Create Test Script

Create file `contracts/test-interaction.js`:

```javascript
const { ethers } = require('hardhat');

async function testContracts() {
	console.log('🧪 Testing VeDonate contracts...');

	const [deployer, donor] = await ethers.getSigners();

	// Get contracts
	const veDonate = await ethers.getContractAt(
		'VeDonate',
		'0x...VEDONATE_ADDRESS'
	);
	const b3trToken = await ethers.getContractAt(
		'B3TRToken',
		'0x...B3TR_ADDRESS'
	);
	const donorBadges = await ethers.getContractAt(
		'DonorBadges',
		'0x...BADGES_ADDRESS'
	);

	// Test 1: Donor registration
	console.log('📝 Test 1: Donor registration...');
	const tx1 = await veDonate.connect(donor).registerDonor();
	await tx1.wait();
	console.log('✅ Donor registered');

	// Test 2: Adding donation
	console.log('🩸 Test 2: Adding donation...');
	const tx2 = await veDonate
		.connect(deployer)
		.addDonation(donor.address, 'blood', 450, 'test-center-001');
	await tx2.wait();
	console.log('✅ Donation added');

	// Test 3: Check rewards
	console.log('💰 Test 3: Check rewards...');
	const donorInfo = await veDonate.getDonorInfo(donor.address);
	const b3trBalance = await b3trToken.balanceOf(donor.address);
	const badges = await donorBadges.getDonorBadges(donor.address);

	console.log('📊 Results:');
	console.log('- Total donations:', donorInfo.totalDonations.toString());
	console.log('- B3TR balance:', ethers.formatEther(b3trBalance));
	console.log('- Number of badges:', badges.length);

	console.log('🎉 All tests passed!');
}

testContracts()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('❌ Testing error:', error);
		process.exit(1);
	});
```

### Run Tests

```bash
cd contracts
npx hardhat run test-interaction.js --network vechain_testnet
```

## 🚨 Possible Issues and Solutions

### Issue: "Insufficient VTHO"

**Solution**: Get more test VET tokens:

- https://faucet.vecha.in/
- https://faucet.vechain.org/

### Issue: "Contract not found"

**Solution**:

1. Check contract addresses
2. Make sure contracts are deployed
3. Check connection to testnet

### Issue: "Transaction failed"

**Solution**:

1. Check VET balance
2. Increase gas limit
3. Check access permissions

### Issue: "Invalid donation type"

**Solution**: Use only "blood" or "plasma"

## 📊 Expected Testing Results

### After first donation:

- ✅ Donor registered
- ✅ 1 donation in history
- ✅ 10 B3TR tokens (for blood)
- ✅ 1 NFT badge "First Donation"

### After 5 donations:

- ✅ 5 donations in history
- ✅ 50 B3TR tokens
- ✅ 2 NFT badges (First + Bronze)

### After 10 donations:

- ✅ 10 donations in history
- ✅ 100 B3TR tokens
- ✅ 3 NFT badges (First + Bronze + Silver)

## 🎯 Additional Tests

### Edge Cases Test:

1. **Donation duplication**: Try to add donation twice
2. **Invalid parameters**: Test with amount < 200 or > 500
3. **Unregistered donor**: Try to add donation without registration

### Performance Test:

1. **Multiple donations**: Add 10+ donations
2. **Gas check**: Track gas usage
3. **Execution time**: Measure transaction time

## 📝 Testing Checklist

- [ ] Wallet connects
- [ ] Donor registration works
- [ ] Adding donation works
- [ ] B3TR tokens are awarded
- [ ] NFT badges are created
- [ ] Donation history is displayed
- [ ] Global statistics are updated
- [ ] All events are generated
- [ ] Transactions are visible in Explorer
- [ ] Edge cases are handled
