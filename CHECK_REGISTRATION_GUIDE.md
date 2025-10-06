# 🔍 How to Check User Registration in VeDonate

## Method 1: Via VeChain Explorer (Recommended)

### Step 1: Open VeChain Testnet Explorer

Go to: https://explore-testnet.vechain.org/

### Step 2: Find VeDonate Contract

- Contract address: `0x3e445638b907d942c33b904d6ea6951ac533bc34`
- Paste address in search bar and press Enter

### Step 3: Check Registration Events

1. Go to **"Events"** or **"Logs"** tab
2. Find `DonorRegistered` event
3. Check if there is an event with user address: `0xb302484fc7cbecad3983E6C33efE28C3286972f6`

### Step 4: Use Filters

In events section you can use filters:

- **Event**: `DonorRegistered`
- **Address**: `0xb302484fc7cbecad3983E6C33efE28C3286972f6`

## Method 2: Via Script (For Developers)

### Run Check Script:

```bash
cd /Users/irine/Desktop/vedonate
node check-user-registration.js
```

This script:

- ✅ Will check registration status via `isDonorRegistered()`
- 📊 Will show complete donor information
- 💡 Will explain results

## Method 3: Via VeChain Explorer - Direct Function Check

### Step 1: Open Contract

- Go to: https://explore-testnet.vechain.org/accounts/0x3e445638b907d942c33b904d6ea6951ac533bc34

### Step 2: Find `isDonorRegistered` Function

- Go to **"Contract"** or **"Read Contract"** tab
- Find function `isDonorRegistered(address donor)`

### Step 3: Call Function

- In `donor` field enter: `0xb302484fc7cbecad3983E6C33efE28C3286972f6`
- Click **"Query"** or **"Call"**

### Result:

- `true` = user is registered
- `false` = user is not registered

## Method 4: Via Browser (Web3)

### Open browser console on VeChain Explorer page and execute:

```javascript
// Connect to VeChain Testnet
const thor = new ThorClient('https://testnet.vechain.org');
const contractAddress = '0x3e445638b907d942c33b904d6ea6951ac533bc34';
const userAddress = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';

// Function ABI
const abi = ['function isDonorRegistered(address donor) view returns (bool)'];
const contract = thor.account(contractAddress);
const abiContract = new ABIContract(abi);

// Check
const method = abiContract.getMethodById('isDonorRegistered');
const result = await contract.method(method).call(userAddress);
console.log('Registered:', result.decoded[0]);
```

## 🎯 Expected Result

If user is **already registered**, you will see:

- ✅ `isDonorRegistered()` returns `true`
- 📝 `DonorRegistered` event in logs
- 💡 This explains "execution reverted" error - contract rejects duplicate registration

## 🔧 Problem Solution

If user is already registered:

1. **Do not try to register again** - this will cause an error
2. **Update user data** - call `fetchDonorData()`
3. **Show appropriate interface** - for already registered users

## 📞 Support

If you have problems with checking, verify:

- ✅ Internet connection
- ✅ Contract address correctness
- ✅ VeChain Testnet availability
