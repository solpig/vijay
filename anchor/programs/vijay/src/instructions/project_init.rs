use anchor_lang::prelude::*;

use super::Client;

pub fn initialize_project(
    ctx: Context<ProjectInfo>,
    _counter: u64,
    name: String,
    description: String,
    url: String,
    pay_amount: u64,
) -> Result<()> {
    let project = &mut ctx.accounts.project;
    project.name = name;
    project.description = description;
    project.url = url;
    project.pay_amount = pay_amount;
    project.is_active = false;
    project.owner = ctx.accounts.signer.key().clone();
    project.assigned_freelancer = Pubkey::default();
    project.assigned_freelancer_project_id = 0;
    Ok(())
}

#[derive(Accounts)]
#[instruction(counter: u64)]
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
        seeds = [b"client_project", counter.to_le_bytes().as_ref(), signer.key().as_ref()],
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
    pub pay_amount: u64,
    pub is_active: bool,
    pub owner: Pubkey,
    pub assigned_freelancer: Pubkey,
    pub assigned_freelancer_project_id: u64,
}
