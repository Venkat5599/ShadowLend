use anchor_lang::prelude::*;

use crate::state::Pool;
use crate::errors::LendingError;

pub fn update_interest_rates(pool: &mut Pool) -> Result<()> {
    let utilization = if pool.total_deposits == 0 {
        0
    } else {
        ((pool.total_borrows * 100000) / pool.total_deposits) as u64
    };
    
    pool.utilization_rate = utilization;
    
    let model = &pool.interest_model;
    
    // Calculate borrow rate based on utilization
    let borrow_rate = if utilization <= model.optimal_utilization {
        // Below optimal: base_rate + (utilization * slope1)
        model.base_rate + (utilization * model.slope1) / 100000
    } else {
        // Above optimal: base_rate + (optimal * slope1) + ((utilization - optimal) * slope2)
        let excess_utilization = utilization - model.optimal_utilization;
        model.base_rate 
            + (model.optimal_utilization * model.slope1) / 100000
            + (excess_utilization * model.slope2) / 100000
    };
    
    pool.current_borrow_rate = borrow_rate;
    
    // Calculate deposit rate: borrow_rate * utilization * (1 - reserve_factor)
    let deposit_rate = (borrow_rate * utilization * (100000 - model.reserve_factor)) 
        / (100000 * 100000);
    
    pool.current_deposit_rate = deposit_rate;
    
    pool.last_update_ts = Clock::get()?.unix_timestamp;
    
    Ok(())
}