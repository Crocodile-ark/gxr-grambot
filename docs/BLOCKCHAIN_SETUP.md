
# ⛓️ Blockchain Integration - GXR Grambot

Panduan lengkap integrasi blockchain untuk sistem wallet dan claim rewards GXR Grambot.

## 🌐 Overview Blockchain Integration

GXR Grambot mendukung multi-chain wallet integration untuk claim rewards dengan sistem evolusi yang terintegrasi dengan smart contracts.

### 🏗️ Supported Networks
- **Ethereum** (ETH) - Primary network
- **Binance Smart Chain** (BSC) - Secondary network  
- **Polygon** (MATIC) - Low fee alternative
- **Arbitrum** - Layer 2 solution
- **Solana** - High performance blockchain

### 💰 Token Standards
- **ERC-20** - Ethereum dan compatible chains
- **BEP-20** - Binance Smart Chain
- **SPL** - Solana Program Library

## 📱 Wallet Integration

### 🔗 Supported Wallet Types
```python
SUPPORTED_WALLETS = {
    'metamask': {
        'name': 'MetaMask',
        'icon': '🦊',
        'chains': ['ethereum', 'bsc', 'polygon', 'arbitrum'],
        'deeplink': 'https://metamask.app.link/'
    },
    'trust_wallet': {
        'name': 'Trust Wallet', 
        'icon': '🛡️',
        'chains': ['ethereum', 'bsc', 'polygon'],
        'deeplink': 'https://link.trustwallet.com/'
    },
    'phantom': {
        'name': 'Phantom',
        'icon': '👻', 
        'chains': ['solana'],
        'deeplink': 'https://phantom.app/'
    },
    'coinbase_wallet': {
        'name': 'Coinbase Wallet',
        'icon': '🏦',
        'chains': ['ethereum', 'polygon'],
        'deeplink': 'https://wallet.coinbase.com/'
    },
    'binance_wallet': {
        'name': 'Binance Chain Wallet',
        'icon': '🟡',
        'chains': ['bsc'],
        'deeplink': 'https://www.binance.org/'
    },
    'walletconnect': {
        'name': 'WalletConnect',
        'icon': '🔗',
        'chains': ['ethereum', 'bsc', 'polygon', 'arbitrum'],
        'universal': True
    }
}
```

### 🔧 Wallet Connection System

#### Database Schema
```sql
-- Wallet connections table
CREATE TABLE user_wallets (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    wallet_address VARCHAR(200) NOT NULL,
    wallet_type VARCHAR(50) NOT NULL,
    chain VARCHAR(50) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    verified BOOLEAN DEFAULT false,
    connected_at TIMESTAMP DEFAULT NOW(),
    last_used TIMESTAMP,
    UNIQUE(user_id, wallet_address, chain)
);

-- Claim transactions table
CREATE TABLE claim_transactions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    wallet_address VARCHAR(200) NOT NULL,
    amount DECIMAL(18,8) NOT NULL,
    chain VARCHAR(50) NOT NULL,
    tx_hash VARCHAR(200),
    status VARCHAR(20) DEFAULT 'pending',
    evolution_level INTEGER NOT NULL,
    claimed_at TIMESTAMP DEFAULT NOW()
);

-- Chain configurations
CREATE TABLE chain_configs (
    id SERIAL PRIMARY KEY,
    chain_name VARCHAR(50) UNIQUE NOT NULL,
    chain_id INTEGER NOT NULL,
    rpc_url VARCHAR(500) NOT NULL,
    token_contract VARCHAR(200),
    min_claim_amount DECIMAL(18,8) DEFAULT 1,
    gas_limit INTEGER DEFAULT 21000,
    is_active BOOLEAN DEFAULT true
);
```

#### Wallet Connection Implementation
```python
# wallet_manager.py
import re
from typing import Dict, Optional, List

class WalletManager:
    def __init__(self):
        self.supported_chains = {
            'ethereum': {'chain_id': 1, 'name': 'Ethereum'},
            'bsc': {'chain_id': 56, 'name': 'Binance Smart Chain'},
            'polygon': {'chain_id': 137, 'name': 'Polygon'},
            'arbitrum': {'chain_id': 42161, 'name': 'Arbitrum One'},
            'solana': {'chain_id': None, 'name': 'Solana'}
        }
    
    def validate_wallet_address(self, address: str, chain: str) -> bool:
        """Validate wallet address format"""
        if not address:
            return False
        
        validation_patterns = {
            'ethereum': r'^0x[a-fA-F0-9]{40}$',
            'bsc': r'^0x[a-fA-F0-9]{40}$', 
            'polygon': r'^0x[a-fA-F0-9]{40}$',
            'arbitrum': r'^0x[a-fA-F0-9]{40}$',
            'solana': r'^[1-9A-HJ-NP-Za-km-z]{32,44}$'
        }
        
        pattern = validation_patterns.get(chain)
        if not pattern:
            return False
        
        return bool(re.match(pattern, address))
    
    async def connect_wallet(self, user_id: int, wallet_data: Dict) -> Dict:
        """Connect wallet to user account"""
        address = wallet_data.get('address', '').strip()
        wallet_type = wallet_data.get('type', '')
        chain = wallet_data.get('chain', 'ethereum')
        
        # Validate input
        if not self.validate_wallet_address(address, chain):
            return {'success': False, 'error': 'Invalid wallet address format'}
        
        if chain not in self.supported_chains:
            return {'success': False, 'error': 'Unsupported blockchain'}
        
        # Check if wallet already connected
        existing = await self.get_user_wallet(user_id, address, chain)
        if existing:
            return {'success': False, 'error': 'Wallet already connected'}
        
        # Save wallet connection
        await self.save_wallet_connection(user_id, address, wallet_type, chain)
        
        return {
            'success': True, 
            'message': f'Wallet connected successfully to {chain}',
            'address': address,
            'chain': chain
        }
    
    async def get_user_wallets(self, user_id: int) -> List[Dict]:
        """Get all connected wallets for user"""
        query = """
        SELECT wallet_address, wallet_type, chain, is_primary, verified, connected_at
        FROM user_wallets 
        WHERE user_id = %s 
        ORDER BY is_primary DESC, connected_at DESC
        """
        
        result = await execute_query(query, (user_id,))
        
        wallets = []
        for row in result:
            wallets.append({
                'address': row[0],
                'type': row[1], 
                'chain': row[2],
                'is_primary': row[3],
                'verified': row[4],
                'connected_at': row[5]
            })
        
        return wallets
    
    async def set_primary_wallet(self, user_id: int, address: str, chain: str) -> bool:
        """Set wallet as primary for claims"""
        # Remove primary from other wallets
        await execute_query(
            "UPDATE user_wallets SET is_primary = false WHERE user_id = %s",
            (user_id,)
        )
        
        # Set new primary
        result = await execute_query(
            "UPDATE user_wallets SET is_primary = true WHERE user_id = %s AND wallet_address = %s AND chain = %s",
            (user_id, address, chain)
        )
        
        return result.rowcount > 0

wallet_manager = WalletManager()
```

## 💳 Smart Contract Integration

### 🏭 Token Contract Structure
```solidity
// GXRToken.sol
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract GXRToken is ERC20, Ownable, Pausable {
    mapping(address => bool) public authorized;
    mapping(address => uint256) public claimLimits;
    mapping(address => uint256) public lastClaimTime;
    
    uint256 public constant CLAIM_COOLDOWN = 6 hours;
    
    event ClaimReward(address indexed user, uint256 amount, uint256 evolutionLevel);
    event AuthorizedUpdated(address indexed account, bool authorized);
    
    constructor() ERC20("GXR Token", "GXR") {
        _mint(msg.sender, 10000000000 * 10**decimals()); // 10B total supply
    }
    
    modifier onlyAuthorized() {
        require(authorized[msg.sender], "Not authorized");
        _;
    }
    
    function setAuthorized(address account, bool _authorized) external onlyOwner {
        authorized[account] = _authorized;
        emit AuthorizedUpdated(account, _authorized);
    }
    
    function setClaimLimit(address user, uint256 limit) external onlyAuthorized {
        claimLimits[user] = limit;
    }
    
    function claimReward(address user, uint256 amount, uint256 evolutionLevel) 
        external 
        onlyAuthorized 
        whenNotPaused 
    {
        require(block.timestamp >= lastClaimTime[user] + CLAIM_COOLDOWN, "Claim cooldown");
        require(amount <= claimLimits[user], "Exceeds claim limit");
        require(amount > 0, "Invalid amount");
        
        lastClaimTime[user] = block.timestamp;
        _transfer(owner(), user, amount);
        
        emit ClaimReward(user, amount, evolutionLevel);
    }
    
    function getClaimInfo(address user) external view returns (
        uint256 limit,
        uint256 lastClaim,
        uint256 nextClaimTime,
        bool canClaim
    ) {
        limit = claimLimits[user];
        lastClaim = lastClaimTime[user];
        nextClaimTime = lastClaim + CLAIM_COOLDOWN;
        canClaim = block.timestamp >= nextClaimTime;
    }
}
```

### 🔗 Contract Interaction
```python
# blockchain_client.py
from web3 import Web3
import json
import os

class BlockchainClient:
    def __init__(self, chain: str):
        self.chain = chain
        self.w3 = self._get_web3_connection()
        self.contract = self._get_contract()
    
    def _get_web3_connection(self):
        """Get Web3 connection for specific chain"""
        rpc_urls = {
            'ethereum': os.getenv('ETHEREUM_RPC_URL', 'https://mainnet.infura.io/v3/YOUR_KEY'),
            'bsc': 'https://bsc-dataseed1.binance.org/',
            'polygon': 'https://polygon-rpc.com/',
            'arbitrum': 'https://arb1.arbitrum.io/rpc'
        }
        
        rpc_url = rpc_urls.get(self.chain)
        if not rpc_url:
            raise ValueError(f"Unsupported chain: {self.chain}")
        
        return Web3(Web3.HTTPProvider(rpc_url))
    
    def _get_contract(self):
        """Get token contract instance"""
        contract_addresses = {
            'ethereum': os.getenv('ETHEREUM_CONTRACT_ADDRESS'),
            'bsc': os.getenv('BSC_CONTRACT_ADDRESS'),
            'polygon': os.getenv('POLYGON_CONTRACT_ADDRESS'),
            'arbitrum': os.getenv('ARBITRUM_CONTRACT_ADDRESS')
        }
        
        contract_address = contract_addresses.get(self.chain)
        if not contract_address:
            return None
        
        with open('abi/GXRToken.json', 'r') as f:
            contract_abi = json.load(f)
        
        return self.w3.eth.contract(
            address=contract_address,
            abi=contract_abi
        )
    
    async def claim_reward(self, wallet_address: str, amount: int, evolution_level: int) -> Dict:
        """Execute claim reward transaction"""
        if not self.contract:
            return {'success': False, 'error': 'Contract not available'}
        
        try:
            # Check if user can claim
            claim_info = self.contract.functions.getClaimInfo(wallet_address).call()
            if not claim_info[3]:  # canClaim
                return {'success': False, 'error': 'Claim in cooldown'}
            
            # Prepare transaction
            private_key = os.getenv('BOT_PRIVATE_KEY')
            bot_account = self.w3.eth.account.from_key(private_key)
            
            # Build transaction
            transaction = self.contract.functions.claimReward(
                wallet_address,
                amount,
                evolution_level
            ).build_transaction({
                'from': bot_account.address,
                'gas': 100000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': self.w3.eth.get_transaction_count(bot_account.address)
            })
            
            # Sign and send transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            return {
                'success': True,
                'tx_hash': tx_hash.hex(),
                'amount': amount,
                'chain': self.chain
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_balance(self, wallet_address: str) -> int:
        """Get GXR token balance"""
        if not self.contract:
            return 0
        
        try:
            balance = self.contract.functions.balanceOf(wallet_address).call()
            return balance // (10 ** 18)  # Convert from wei
        except:
            return 0
    
    def get_claim_limit(self, wallet_address: str) -> int:
        """Get user's claim limit"""
        if not self.contract:
            return 0
        
        try:
            limit = self.contract.functions.claimLimits(wallet_address).call()
            return limit // (10 ** 18)
        except:
            return 0

# Usage
async def process_claim(user_id: int, chain: str = 'bsc'):
    """Process blockchain claim for user"""
    # Get user's primary wallet
    wallets = await wallet_manager.get_user_wallets(user_id)
    primary_wallet = next((w for w in wallets if w['is_primary'] and w['chain'] == chain), None)
    
    if not primary_wallet:
        return {'success': False, 'error': 'No primary wallet connected'}
    
    # Get user evolution data
    user_data = await get_user_data(user_id)
    evolution_level = user_data['evolution_level']
    claim_amount = get_evolution_claim_amount(evolution_level)
    
    # Execute blockchain claim
    client = BlockchainClient(chain)
    result = await client.claim_reward(
        primary_wallet['address'], 
        claim_amount, 
        evolution_level
    )
    
    if result['success']:
        # Save transaction record
        await save_claim_transaction(
            user_id,
            primary_wallet['address'],
            claim_amount,
            chain,
            result['tx_hash'],
            evolution_level
        )
    
    return result
```

## 💸 Claim Reward System

### 🎯 Evolution-Based Claims
```python
# evolution_claims.py
from decimal import Decimal

class EvolutionClaimSystem:
    def __init__(self):
        self.evolution_limits = {
            1: {'name': 'Rookie', 'max_claim': 5, 'pool': Decimal('2500000')},
            2: {'name': 'Charger', 'max_claim': 10, 'pool': Decimal('5000000')},
            3: {'name': 'Breaker', 'max_claim': 15, 'pool': Decimal('7500000')},
            4: {'name': 'Phantom', 'max_claim': 20, 'pool': Decimal('100000000')},
            5: {'name': 'Overdrive', 'max_claim': 25, 'pool': Decimal('125000000')},
            6: {'name': 'Genesis', 'max_claim': 30, 'pool': Decimal('1500000000')},
            7: {'name': 'Final Form', 'max_claim': 50, 'pool': Decimal('2000000000')}
        }
    
    def get_claim_amount(self, evolution_level: int, points: int) -> int:
        """Calculate claim amount based on evolution and points"""
        evolution_data = self.evolution_limits.get(evolution_level, self.evolution_limits[1])
        max_claim = evolution_data['max_claim']
        
        # Base claim amount
        base_amount = min(max_claim, points // 1000)  # 1 GXR per 1000 points
        
        # Minimum 1 GXR for any valid claim
        return max(1, base_amount)
    
    def can_claim_from_pool(self, evolution_level: int, amount: int) -> bool:
        """Check if pool has enough tokens"""
        evolution_data = self.evolution_limits.get(evolution_level)
        if not evolution_data:
            return False
        
        current_pool = self.get_current_pool_balance(evolution_level)
        return current_pool >= amount
    
    async def execute_evolution_claim(self, user_id: int) -> Dict:
        """Execute claim based on user's evolution level"""
        user_data = await get_user_data(user_id)
        evolution_level = user_data['evolution_level']
        points = user_data['points']
        
        # Calculate claim amount
        claim_amount = self.get_claim_amount(evolution_level, points)
        
        # Check pool availability
        if not self.can_claim_from_pool(evolution_level, claim_amount):
            return {'success': False, 'error': 'Pool insufficient for this evolution level'}
        
        # Check claim cooldown
        if not await self.can_claim_now(user_id):
            return {'success': False, 'error': 'Claim still in 6-hour cooldown'}
        
        # Get user's wallet
        wallets = await wallet_manager.get_user_wallets(user_id)
        primary_wallet = next((w for w in wallets if w['is_primary']), None)
        
        if not primary_wallet:
            return {'success': False, 'error': 'No wallet connected. Use /connectwallet first'}
        
        # Execute blockchain claim
        result = await process_claim(user_id, primary_wallet['chain'])
        
        if result['success']:
            # Update pool balance
            await self.update_pool_balance(evolution_level, claim_amount)
            
            # Reset user points (claimed)
            await update_user_points(user_id, 0)
            
            # Update last claim time
            await update_last_claim(user_id)
        
        return result

evolution_claim_system = EvolutionClaimSystem()
```

### 📊 Pool Management
```python
# pool_manager.py
from decimal import Decimal

class PoolManager:
    def __init__(self):
        self.pools = {}
        self.initialize_pools()
    
    def initialize_pools(self):
        """Initialize evolution pools"""
        initial_pools = {
            1: Decimal('2500000'),     # 2.5M for Rookie
            2: Decimal('5000000'),     # 5M for Charger  
            3: Decimal('7500000'),     # 7.5M for Breaker
            4: Decimal('100000000'),   # 100M for Phantom
            5: Decimal('125000000'),   # 125M for Overdrive
            6: Decimal('1500000000'),  # 1.5B for Genesis
            7: Decimal('2000000000')   # 2B for Final Form
        }
        
        for level, amount in initial_pools.items():
            self.pools[level] = {
                'total': amount,
                'distributed': Decimal('0'),
                'remaining': amount
            }
    
    async def get_pool_status(self, evolution_level: int) -> Dict:
        """Get current pool status"""
        pool = self.pools.get(evolution_level)
        if not pool:
            return None
        
        # Get real-time distributed amount from database
        distributed = await self.get_distributed_amount(evolution_level)
        remaining = pool['total'] - distributed
        
        return {
            'level': evolution_level,
            'total': float(pool['total']),
            'distributed': float(distributed),
            'remaining': float(remaining),
            'percentage_used': float((distributed / pool['total']) * 100)
        }
    
    async def distribute_from_pool(self, evolution_level: int, amount: Decimal) -> bool:
        """Distribute tokens from evolution pool"""
        pool = self.pools.get(evolution_level)
        if not pool:
            return False
        
        current_distributed = await self.get_distributed_amount(evolution_level)
        new_distributed = current_distributed + amount
        
        if new_distributed > pool['total']:
            return False  # Pool exhausted
        
        # Record distribution
        await self.record_distribution(evolution_level, amount)
        return True
    
    async def get_all_pools_status(self) -> List[Dict]:
        """Get status of all evolution pools"""
        pools_status = []
        
        for level in range(1, 8):
            status = await self.get_pool_status(level)
            if status:
                pools_status.append(status)
        
        return pools_status

pool_manager = PoolManager()
```

## 🎮 Telegram Bot Integration

### 💳 Wallet Commands
```python
# wallet_commands.py
async def connect_wallet_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Connect wallet command"""
    user_id = update.effective_user.id
    
    # Create wallet selection keyboard
    wallet_types = [
        [InlineKeyboardButton("🦊 MetaMask", callback_data="wallet_metamask")],
        [InlineKeyboardButton("🛡️ Trust Wallet", callback_data="wallet_trust")],
        [InlineKeyboardButton("👻 Phantom", callback_data="wallet_phantom")],
        [InlineKeyboardButton("🏦 Coinbase Wallet", callback_data="wallet_coinbase")],
        [InlineKeyboardButton("🟡 Binance Wallet", callback_data="wallet_binance")],
        [InlineKeyboardButton("🔗 WalletConnect", callback_data="wallet_walletconnect")]
    ]
    
    await update.message.reply_text(
        "💳 **CONNECT WALLET**\n\n"
        "Pilih jenis wallet untuk connect:\n\n"
        "🔒 Wallet address akan disimpan aman\n"
        "💰 Diperlukan untuk claim GXR rewards\n"
        "⛓️ Support multiple blockchain",
        reply_markup=InlineKeyboardMarkup(wallet_types),
        parse_mode='Markdown'
    )

async def wallet_selection_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle wallet type selection"""
    query = update.callback_query
    user_id = query.from_user.id
    wallet_type = query.data.replace('wallet_', '')
    
    # Store wallet type in user session
    context.user_data['selected_wallet'] = wallet_type
    
    # Show chain selection for multi-chain wallets
    if wallet_type in ['metamask', 'trust', 'walletconnect']:
        chains = [
            [InlineKeyboardButton("🟦 Ethereum", callback_data="chain_ethereum")],
            [InlineKeyboardButton("🟡 BSC", callback_data="chain_bsc")],
            [InlineKeyboardButton("🟣 Polygon", callback_data="chain_polygon")],
            [InlineKeyboardButton("🔵 Arbitrum", callback_data="chain_arbitrum")]
        ]
    elif wallet_type == 'phantom':
        chains = [[InlineKeyboardButton("🟢 Solana", callback_data="chain_solana")]]
    else:
        chains = [[InlineKeyboardButton("🟦 Ethereum", callback_data="chain_ethereum")]]
    
    await query.edit_message_text(
        f"⛓️ **SELECT BLOCKCHAIN**\n\n"
        f"Wallet: {SUPPORTED_WALLETS[wallet_type]['name']}\n\n"
        f"Pilih blockchain untuk wallet connection:",
        reply_markup=InlineKeyboardMarkup(chains),
        parse_mode='Markdown'
    )

async def chain_selection_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle blockchain selection"""
    query = update.callback_query
    user_id = query.from_user.id
    chain = query.data.replace('chain_', '')
    
    wallet_type = context.user_data.get('selected_wallet')
    
    await query.edit_message_text(
        f"📝 **ENTER WALLET ADDRESS**\n\n"
        f"Wallet: {SUPPORTED_WALLETS[wallet_type]['name']}\n"
        f"Chain: {chain.upper()}\n\n"
        f"Reply dengan wallet address Anda:\n"
        f"Format: /setwallet YOUR_WALLET_ADDRESS",
        parse_mode='Markdown'
    )
    
    # Store in user session
    context.user_data['selected_chain'] = chain

async def set_wallet_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Set wallet address"""
    user_id = update.effective_user.id
    
    if not context.args:
        await update.message.reply_text("❌ Format: /setwallet YOUR_WALLET_ADDRESS")
        return
    
    wallet_address = context.args[0].strip()
    wallet_type = context.user_data.get('selected_wallet', 'metamask')
    chain = context.user_data.get('selected_chain', 'bsc')
    
    # Connect wallet
    result = await wallet_manager.connect_wallet(user_id, {
        'address': wallet_address,
        'type': wallet_type,
        'chain': chain
    })
    
    if result['success']:
        # Set as primary if first wallet
        wallets = await wallet_manager.get_user_wallets(user_id)
        if len(wallets) == 1:
            await wallet_manager.set_primary_wallet(user_id, wallet_address, chain)
        
        await update.message.reply_text(
            f"✅ **WALLET CONNECTED!**\n\n"
            f"💳 Wallet: {wallet_type.title()}\n"
            f"⛓️ Chain: {chain.upper()}\n"
            f"📍 Address: `{wallet_address[:6]}...{wallet_address[-4:]}`\n\n"
            f"🎯 Sekarang bisa claim GXR rewards!",
            parse_mode='Markdown'
        )
    else:
        await update.message.reply_text(f"❌ {result['error']}")

async def claim_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Claim GXR rewards to connected wallet"""
    user_id = update.effective_user.id
    
    # Check if wallet connected
    wallets = await wallet_manager.get_user_wallets(user_id)
    if not wallets:
        keyboard = [[InlineKeyboardButton("💳 Connect Wallet", callback_data="connect_wallet")]]
        await update.message.reply_text(
            "❌ **NO WALLET CONNECTED**\n\n"
            "Kamu perlu connect wallet dulu untuk claim rewards!\n\n"
            "💡 Klik tombol di bawah untuk connect wallet:",
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode='Markdown'
        )
        return
    
    # Execute claim
    result = await evolution_claim_system.execute_evolution_claim(user_id)
    
    if result['success']:
        await update.message.reply_text(
            f"🎉 **CLAIM SUCCESSFUL!**\n\n"
            f"💰 Amount: {result['amount']} GXR\n"
            f"⛓️ Chain: {result['chain'].upper()}\n"
            f"🔗 TX: `{result['tx_hash']}`\n\n"
            f"✅ Tokens sent to your wallet!\n"
            f"⏰ Next claim: 6 hours",
            parse_mode='Markdown'
        )
    else:
        await update.message.reply_text(f"❌ Claim failed: {result['error']}")
```

## 📊 Dashboard Integration

### 💳 Wallet Management Panel
```typescript
// WalletPanel.tsx
export function WalletPanel({ userId }: { userId: number }) {
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [claimStatus, setClaimStatus] = useState(null);

  const walletTypes = [
    { id: 'metamask', name: 'MetaMask', icon: '🦊', chains: ['ethereum', 'bsc', 'polygon'] },
    { id: 'trust', name: 'Trust Wallet', icon: '🛡️', chains: ['ethereum', 'bsc'] },
    { id: 'phantom', name: 'Phantom', icon: '👻', chains: ['solana'] },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: '🏦', chains: ['ethereum'] }
  ];

  const executeClaim = async () => {
    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      const result = await response.json();
      setClaimStatus(result);
      
      if (result.success) {
        showNotification({
          type: 'success',
          title: 'Claim Successful!',
          message: `${result.amount} GXR sent to wallet`
        });
      }
    } catch (error) {
      setClaimStatus({ success: false, error: 'Network error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Connected Wallets</h3>
        {wallets.map(wallet => (
          <WalletCard 
            key={wallet.address}
            wallet={wallet}
            onSetPrimary={() => setPrimaryWallet(wallet)}
          />
        ))}
      </div>

      {/* Claim Section */}
      <div className="bg-gxr-dark-secondary rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">🎯 Claim Rewards</h3>
        
        {wallets.length > 0 ? (
          <ClaimButton onClaim={executeClaim} status={claimStatus} />
        ) : (
          <div className="text-center text-gxr-text-secondary">
            <p>Connect a wallet to claim rewards</p>
            <button className="mt-4 px-6 py-2 bg-gxr-green rounded-lg">
              Connect Wallet
            </button>
          </div>
        )}
      </div>

      {/* Pool Status */}
      <PoolStatusCard />
    </div>
  );
}
```

## 🔐 Security Considerations

### 🛡️ Security Best Practices

1. **Private Key Management**
```python
# Never store private keys in code
PRIVATE_KEY = os.getenv('BOT_PRIVATE_KEY')  # From secure environment

# Use hardware wallets for production
# Consider multi-sig for large amounts
```

2. **Transaction Validation**
```python
def validate_claim_transaction(user_id: int, amount: int) -> bool:
    """Validate claim before blockchain execution"""
    
    # Check user evolution level
    user_data = get_user_data(user_id)
    max_claim = get_evolution_claim_limit(user_data['evolution_level'])
    
    if amount > max_claim:
        return False
    
    # Check last claim time (6 hour cooldown)
    if not can_claim_now(user_id):
        return False
    
    # Check pool availability
    if not pool_has_sufficient_balance(user_data['evolution_level'], amount):
        return False
    
    return True
```

3. **Rate Limiting**
```python
# Prevent abuse with rate limiting
CLAIM_RATE_LIMIT = {
    'requests_per_hour': 1,
    'requests_per_day': 4
}

# Monitor for suspicious activity
def detect_suspicious_activity(user_id: int) -> bool:
    recent_claims = get_recent_claims(user_id, hours=24)
    return len(recent_claims) > CLAIM_RATE_LIMIT['requests_per_day']
```

## 📈 Monitoring & Analytics

### 📊 Blockchain Analytics
```python
# analytics.py
class BlockchainAnalytics:
    def get_claim_statistics(self, period: str = '24h') -> Dict:
        """Get claim statistics for period"""
        query = f"""
        SELECT 
            COUNT(*) as total_claims,
            SUM(amount) as total_amount,
            AVG(amount) as avg_amount,
            COUNT(DISTINCT user_id) as unique_claimers,
            chain,
            evolution_level
        FROM claim_transactions 
        WHERE claimed_at > NOW() - INTERVAL '{period}'
        GROUP BY chain, evolution_level
        """
        
        return execute_query(query)
    
    def get_pool_utilization(self) -> Dict:
        """Get pool utilization across all evolution levels"""
        utilization = {}
        
        for level in range(1, 8):
            status = pool_manager.get_pool_status(level)
            utilization[level] = {
                'level': level,
                'utilization_percent': status['percentage_used'],
                'remaining_tokens': status['remaining']
            }
        
        return utilization
    
    def get_wallet_distribution(self) -> Dict:
        """Get distribution of wallet types and chains"""
        query = """
        SELECT wallet_type, chain, COUNT(*) as count
        FROM user_wallets
        GROUP BY wallet_type, chain
        ORDER BY count DESC
        """
        
        return execute_query(query)

analytics = BlockchainAnalytics()
```

---

**⛓️ Blockchain Integration Complete! Ready for Web3 Claims!**
