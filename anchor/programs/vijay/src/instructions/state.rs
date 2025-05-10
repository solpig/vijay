use anchor_lang::prelude::*;
use crate::error_codes::ErrorCode;

pub fn initialize_state(
    ctx: Context<StateInfo>
) -> Result<()> {
    let state = &mut ctx.accounts.state;
    
    if state.owner != Pubkey::default() {
        return Err(error!(ErrorCode::AlreadyInitialized));
    }
    state.owner = *ctx.accounts.signer.key;
    state.balance = 0;
    Ok(())
}

pub fn withdraw_balance(
    ctx: Context<Withdraw>
) -> Result<()> {
    let state = &mut ctx.accounts.state;
    require_keys_eq!(state.owner, ctx.accounts.owner.key(), ErrorCode::UnAuthorizedOwner);
    
    let amount = state.balance;
    
    **state.to_account_info().try_borrow_mut_lamports()? -= amount;
    **ctx.accounts.owner.to_account_info().try_borrow_mut_lamports()? += amount;
    
    state.balance = 0;
    Ok(())
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, has_one = owner)]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct StateInfo<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        space = 8 + State::INIT_SPACE,
        seeds = [b"owner"],
        bump,
        payer = signer,
    )]
    pub state: Account<'info, State>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct State {
    pub owner: Pubkey,
    pub balance: u64
}
