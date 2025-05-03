use anchor_lang::prelude::*;

use super::Client;
use crate::error_codes::ErrorCode;

pub fn initialize_project(
    ctx: Context<ProjectInfo>,
    name: String,
    description: String,
    url: String,
    budget: u64,
) -> Result<()> {

    require!(ctx.accounts.client.owner == ctx.accounts.signer.key(), ErrorCode::NotAnOwner);

    let client = &mut ctx.accounts.client;

    let project_counter = client
        .project_counter
        .checked_add(1)
        .ok_or(ErrorCode::NumericalOverflow)?;
    client.project_counter = project_counter;

    let project = &mut ctx.accounts.project;
    project.name = name;
    project.description = description;
    project.url = url;
    project.budget = budget;
    project.is_active = true;
    project.in_progress = false;
    project.owner = ctx.accounts.signer.key();
    project.assigned_freelancer = Pubkey::default();
    project.assigned_freelancer_project_id = 0;
    Ok(())
}

#[derive(Accounts)]
pub struct ProjectInfo<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"client", signer.key().as_ref()],
        bump,
    )]
    pub client: Account<'info, Client>,

    #[account(
        init,
        space = 8 + Project::INIT_SPACE,
        payer = signer,
        seeds = [b"client_project", client.project_counter.checked_add(1).unwrap().to_le_bytes().as_ref(), signer.key().as_ref()],
        bump
    )]
    pub project: Account<'info, Project>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Project {
    #[max_len(50)]
    pub name: String,
    #[max_len(280)]
    pub description: String,
    #[max_len(50)]
    pub url: String,
    pub budget: u64,
    pub is_active: bool,
    pub in_progress: bool,
    pub owner: Pubkey,
    pub assigned_freelancer: Pubkey,
    pub assigned_freelancer_project_id: u64,
}
