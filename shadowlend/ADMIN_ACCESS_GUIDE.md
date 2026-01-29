# Admin Panel Access Guide

## Overview
The admin panel is **protected** and only accessible to authorized admin wallets. Regular users cannot access it.

## How It Works

### 1. Admin Wallet Configuration
Admin wallets are defined in: `shadowlend/features/shadowlend/hooks/use-admin.ts`

```typescript
const ADMIN_WALLETS = [
  'YOUR_ADMIN_WALLET_ADDRESS_HERE', // Replace with actual admin wallet
  // Add more admin wallets as needed
]
```

### 2. Access Control
- ✅ **Admin wallets**: Can access the admin panel
- ❌ **Regular wallets**: See "Access Denied" message
- ❌ **Not connected**: See "Wallet Not Connected" message

### 3. How to Access Admin Panel

**Option 1: Direct URL (Recommended for admins)**
- Navigate to: `/admin` route
- Example: `http://localhost:8081/admin`

**Option 2: Hidden Button in Settings (Optional)**
- Add a hidden admin button that only shows for admin wallets
- Long-press on version number 5 times to reveal admin button

## Setup Instructions

### Step 1: Add Your Admin Wallet Address

1. Open `shadowlend/features/shadowlend/hooks/use-admin.ts`
2. Replace `'YOUR_ADMIN_WALLET_ADDRESS_HERE'` with your actual wallet address
3. Example:
```typescript
const ADMIN_WALLETS = [
  'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH', // Your admin wallet
  '8xKvPMvXx9Hq3Ry4Tz9Wq5Nz7Yp6Xm5Kn4Jm3Hp2Lq1', // Another admin wallet
]
```

### Step 2: Create Admin Route

Create a new file: `shadowlend/app/admin.tsx`

```typescript
import { AdminInitScreen } from '@/features/shadowlend/screens/admin-init-screen'

export default function AdminPage() {
  return <AdminInitScreen />
}
```

### Step 3: Access the Admin Panel

1. Connect with your admin wallet
2. Navigate to: `http://localhost:8081/admin`
3. You should see the admin panel with:
   - Computation Definitions status
   - Lending Pools management
   - Initialize buttons for new pools

## Security Features

✅ **Wallet-based authentication** - Only specific wallet addresses can access
✅ **Access denied screen** - Non-admin users see clear error message
✅ **No hidden routes** - Admin routes are protected, not hidden
✅ **Client-side protection** - Fast access control without server calls

## Admin Panel Features

### Computation Definitions
- Shows status of all comp defs (Deposit, Borrow, Withdraw, Repay, etc.)
- Indicates which are initialized and ready

### Lending Pools
- **USDC → SOL Pool** (Active) - Users can deposit USDC and borrow SOL
- **SOL → USDC Pool** (Not initialized) - Can be initialized by admin
- Shows pool details: Collateral, Borrow Asset, Max LTV, Liquidation Threshold

### Pool Initialization
- Click "Initialize Pool" button to create new lending pools
- Activity log shows initialization progress
- Real-time status updates

## For Regular Users

Regular users will **never see** the admin panel. If they try to access `/admin`:
- They see "Access Denied" message
- Their wallet address is shown (for verification)
- "Go Back" button to return to app

## Production Deployment

For production:
1. Keep admin wallet addresses in environment variables
2. Use server-side verification for critical operations
3. Add additional security layers (2FA, IP whitelist, etc.)
4. Log all admin actions for audit trail

## Current Status

✅ Admin panel created with full UI
✅ Access control implemented
✅ USDC → SOL pool marked as active
✅ SOL → USDC pool ready to initialize
✅ Beautiful UI with dark mode support
