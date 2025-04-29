#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod vijay {
    use super::*;

  pub fn close(_ctx: Context<CloseVijay>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.vijay.count = ctx.accounts.vijay.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.vijay.count = ctx.accounts.vijay.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeVijay>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.vijay.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeVijay<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Vijay::INIT_SPACE,
  payer = payer
  )]
  pub vijay: Account<'info, Vijay>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseVijay<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub vijay: Account<'info, Vijay>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub vijay: Account<'info, Vijay>,
}

#[account]
#[derive(InitSpace)]
pub struct Vijay {
  count: u8,
}
