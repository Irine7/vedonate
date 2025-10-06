# 🚨 Emergency User Registration

## Problem

VeChain Kit is not initializing properly (`vechainKit: false`), which leads to errors:

- `feeDelegation: undefined`
- `thor: false`
- `Failed to estimate gas`

## 🔧 Solutions

### 1. Direct Registration via VeWorld Wallet

1. **Open VeWorld Wallet**
2. **Go to "DApps" or "Contracts" section**
3. **Add contract**: `0x3e445638b907d942c33b904d6ea6951ac533bc34`
4. **Find function `registerDonor()`**
5. **Call function** without parameters
6. **Confirm transaction**

### 2. Using VeChain Explorer

1. **Open**: https://explore-testnet.vechain.org/accounts/0x3e445638b907d942c33b904d6ea6951ac533bc34
2. **Go to "Contract" tab**
3. **Find function `registerDonor()`**
4. **Connect wallet** via VeWorld
5. **Call function**

### 3. Fixing VeChain Kit

#### Problem: VeChain Kit is not initializing

**Possible causes:**

- Version conflicts
- Issues with dynamic import
- Configuration errors

**Solution 1: Page reload**

```javascript
// In browser console
window.location.reload();
```

**Solution 2: Force initialization**

```javascript
// In browser console
if (window.vechainKit) {
	console.log('VeChain Kit found:', window.vechainKit);
} else {
	console.log('VeChain Kit not found, try reloading the page');
}
```

**Solution 3: Configuration check**
Make sure `.env.local` contains:

```
NEXT_PUBLIC_DELEGATOR_URL=https://sponsor-testnet.vechain.energy/by/90
NEXT_PUBLIC_NETWORK_TYPE=test
```

### 4. Alternative Method - via Code

Add a button to the component for direct call:

```typescript
const handleDirectRegistration = async () => {
	try {
		// Direct call via window.vechain
		if (window.vechain) {
			const result = await window.vechain.sendTransaction({
				clauses: [
					{
						to: '0x3e445638b907d942c33b904d6ea6951ac533bc34',
						value: '0x0',
						data: '0x5b34c965',
					},
				],
			});
			console.log('Result:', result);
		}
	} catch (error) {
		console.error('Error:', error);
	}
};
```

## 🎯 Recommendations

### Immediate actions:

1. **Try registration again** - code now has 3 levels of fallback
2. **If it does not work** - use direct method via VeWorld
3. **Check logs** - now there will be more diagnostic information

### Long-term solutions:

1. **Update VeChain Kit** to latest version
2. **Check compatibility** with Next.js 15
3. **Consider alternative libraries** for working with VeChain

## 📊 Diagnostics

After attempting registration, check in console:

```javascript
// Check state
console.log('VeChain Kit:', window.vechainKit);
console.log('Connection:', window.vechain?.connection);
console.log('Network:', window.vechain?.network);
```

**Expected values:**

- `VeChain Kit`: object (not undefined)
- `Connection`: object with isConnected: true
- `Network`: object with type: 'test'

## 🆘 If nothing helps

1. **Restart application**: `pnpm run dev`
2. **Clear browser cache**
3. **Try in incognito mode**
4. **Check console for JavaScript errors**

## 📞 Support Contacts

- **VeChain Discord**: https://discord.gg/vechain
- **VeChain GitHub**: https://github.com/vechain
- **Documentation**: https://docs.vechain.org/
