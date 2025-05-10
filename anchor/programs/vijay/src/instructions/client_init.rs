use anchor_lang::{prelude::*, solana_program::{native_token::LAMPORTS_PER_SOL, program::invoke, system_instruction}};
use crate::error_codes::ErrorCode;

use super::State;

pub fn initialize_client(
    ctx: Context<ClientInfo>,
    name: String,
    domain: String,
    required_skills: String,
    contact_details: String,
) -> Result<()> {

    let subscription_amount = 1 * LAMPORTS_PER_SOL;
    let signer_bal = ctx.accounts.signer.to_account_info().lamports();

    require!(signer_bal >= subscription_amount, ErrorCode::InsufficientFunds);

    let sys_ins = system_instruction::transfer(
        &ctx.accounts.signer.key(),
        &ctx.accounts.state.key(),
        1 * LAMPORTS_PER_SOL as f64 as u64,
    );

    invoke(
        &sys_ins,
        &[
            ctx.accounts.signer.to_account_info(),
            ctx.accounts.state.to_account_info(),
        ],
    )?;

    let state = &mut ctx.accounts.state;
    state.balance = state.balance.checked_add(subscription_amount).ok_or(ErrorCode::NumericalOverflow)?;

    // creating custom client account
    let client = &mut ctx.accounts.client;
    client.name = name;
    client.domain = domain;
    client.required_skills = required_skills;
    client.contact = contact_details;
    client.project_counter = 0;
    client.owner = ctx.accounts.signer.key();

    // creating custom client report card account
    let client_report = &mut ctx.accounts.client_report_card;
    client_report.total_projects = 0;
    client_report.projects_in_progress = 0;
    client_report.completed = 0;
    client_report.transferred = 0;
    client_report.withdrawn = 0;
    client_report.risk_score = 0;
    client_report.success_rate = 0;
    Ok(())
}

#[derive(Accounts)]
pub struct ClientInfo<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        space = 8 + Client::INIT_SPACE,
        seeds = [b"client", signer.key().as_ref()],
        bump,
        payer = signer,
    )]
    pub client: Account<'info, Client>,

    #[account(
        init,
        space = 8 + ClientReportCard::INIT_SPACE,
        seeds = [b"client_report", signer.key().as_ref()],
        bump,
        payer = signer,
    )]
    pub client_report_card: Account<'info, ClientReportCard>,

    #[account(
        mut,
        seeds = [b"owner"],
        bump
    )]
    pub state: Account<'info, State>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Client {
    #[max_len(50)]
    pub name: String,
    #[max_len(50)]
    pub domain: String,
    #[max_len(50)]
    pub contact: String,
    #[max_len(240)]
    pub required_skills: String,
    pub project_counter: u64,
    pub owner: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct ClientReportCard {
    pub total_projects: u64,
    pub projects_in_progress: u64,
    pub completed: u64,
    pub withdrawn: u64,
    pub transferred: u64,
    pub success_rate: u16,
    pub risk_score: u16,
}
