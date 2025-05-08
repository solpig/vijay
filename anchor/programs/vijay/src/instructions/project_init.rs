use anchor_lang::prelude::*;

use super::{Client, ClientReportCard};
use crate::error_codes::ErrorCode;

pub fn initialize_project(
    ctx: Context<ProjectInfo>,
    name: String,
    description: String,
    url: String,
    budget: u64,
) -> Result<()> {

    require!(ctx.accounts.client.owner == ctx.accounts.signer.key(), ErrorCode::NotAnOwner);

    let name = pad_to_32_string(&name);

    let client = &mut ctx.accounts.client;
    let client_report = &mut ctx.accounts.client_report;

    let project_counter = client
        .project_counter
        .checked_add(1)
        .ok_or(ErrorCode::NumericalOverflow)?;
    
    client.project_counter = project_counter;
    client_report.total_projects = project_counter;

    let project = &mut ctx.accounts.project;
    project.id = project_counter;
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

    #[account(
        mut,
        seeds = [b"client_report", signer.key().as_ref()],
        bump,
    )]
    pub client_report: Account<'info, ClientReportCard>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Project {
    pub id: u64,
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

fn pad_to_32_string(input: &str) -> String {
    let mut trimmed = input.chars().take(32).collect::<String>();
    while trimmed.len() < 32 {
        trimmed.push(' ');
    }
    trimmed
}