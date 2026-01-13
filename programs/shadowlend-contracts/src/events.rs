use anchor_lang::prelude::*;

#[event]
pub struct DepositCompleted {
    pub pool: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct BorrowCompleted {
    pub pool: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct RepayCompleted {
    pub pool: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct WithdrawCompleted {
    pub pool: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct LiquidationExecuted {
    pub pool: Pubkey,
    pub liquidator: Pubkey,
    pub target_user: Pubkey,
    pub repay_amount: u64,
    pub collateral_seized: u64,
    pub timestamp: i64,
}

#[event]
pub struct InterestAccrued {
    pub pool: Pubkey,
    pub total_interest: u128,
    pub new_borrow_rate: u64,
    pub new_deposit_rate: u64,
    pub timestamp: i64,
}