use anchor_lang::{prelude::*, solana_program::{program::invoke, system_instruction}};

use crate::error_codes::{self, ErrorCode};

use super::{ClientReportCard, Freelancer, FreelancerReportCard, Project};

pub fn project_escrow_setup(
    ctx: Context<ProjectSetupInfo>,
    _project_id: u64,
    _freelancer_key: Pubkey,
    amount: u64,
    total_tasks: u64,
) -> Result<()> {
    require!(
        ctx.accounts.project.owner == ctx.accounts.signer.key(),
        error_codes::ErrorCode::UnAuthorizedSetup
    );

    let freelancer = &mut ctx.accounts.freelancer;

    let counter_increment = freelancer
        .project_counter
        .checked_add(1)
        .ok_or(error_codes::ErrorCode::NumericalOverflow)?;
    freelancer.project_counter = counter_increment;

    let project = &mut ctx.accounts.project;
    project.in_progress = true;
    project.assigned_freelancer = ctx.accounts.freelancer.owner;
    project.assigned_freelancer_project_id = counter_increment;

    // set up the escrow account
    let escrow = &mut ctx.accounts.escrow;
    escrow.depositor = ctx.accounts.signer.key();
    escrow.receiver = ctx.accounts.freelancer.owner;
    escrow.budget = amount;
    escrow.total_tasks = total_tasks;
    escrow.tasks_completed = 0;
    escrow.vault = ctx.accounts.vault.key();
    escrow.is_active = true;

    let sys_ins = system_instruction::transfer(
        &ctx.accounts.signer.key(),
        &ctx.accounts.vault.key(),
        amount,
    );

    invoke(
        &sys_ins,
        &[
            ctx.accounts.signer.to_account_info(),
            ctx.accounts.vault.to_account_info(),
        ],
    )?;
    
    // set up the freelancer project
    let freelancer_project = &mut ctx.accounts.freelancer_project;
    freelancer_project.project_name = ctx.accounts.project.name.clone();
    freelancer_project.project_client = ctx.accounts.project.owner;
    freelancer_project.completed_task_url = "".to_string();
    freelancer_project.approved_tasks = 0;
    freelancer_project.rejected_attempts = 0;
    freelancer_project.is_active = true;

    let freelancer_report_card = &mut ctx.accounts.freelancer_report_card;
    freelancer_report_card.total_projects = freelancer_report_card.total_projects.checked_add(1).ok_or(ErrorCode::NumericalOverflow)?;
    freelancer_report_card.projects_in_progress = freelancer_report_card.projects_in_progress.checked_add(1).ok_or(ErrorCode::NumericalOverflow)?;

    let client_report_card = &mut ctx.accounts.client_report_card;
    client_report_card.projects_in_progress = client_report_card.projects_in_progress.checked_add(1).ok_or(ErrorCode::NumericalOverflow)?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(project_id: u64, freelancer_key: Pubkey)]
pub struct ProjectSetupInfo<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"client_project", project_id.to_le_bytes().as_ref(), signer.key().as_ref()],
        bump
    )]
    pub project: Account<'info, Project>,

    #[account(
        mut,
        seeds = [b"freelancer", freelancer_key.as_ref()],
        bump,
    )]
    pub freelancer: Account<'info, Freelancer>,

    #[account(
        init,
        space = 8+Escrow::INIT_SPACE,
        payer = signer,
        seeds = [b"project_escrow", project_id.to_le_bytes().as_ref(), project.name.as_bytes()[..32].as_ref(), project.owner.as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(
        init,
        space = 8,
        payer = signer,
        seeds = [b"vault", project_id.to_le_bytes().as_ref(), project.name.as_bytes()[..32].as_ref(), project.owner.as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,

    #[account(
        init,
        space = 8 + Freelancer::INIT_SPACE,
        payer = signer,
        seeds = [b"freelancer_project", freelancer.project_counter.checked_add(1).unwrap().to_le_bytes().as_ref(), freelancer.owner.as_ref()],
        bump
    )]
    pub freelancer_project: Account<'info, FreelancerProject>,

    #[account(
        mut,
        seeds = [b"freelancer_report", freelancer.owner.as_ref()],
        bump,
    )]
    pub freelancer_report_card: Account<'info, FreelancerReportCard>,

    #[account(
        mut,
        seeds = [b"client_report", signer.key().as_ref()],
        bump,
    )]
    pub client_report_card: Account<'info, ClientReportCard>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub depositor: Pubkey,
    pub receiver: Pubkey,
    pub vault: Pubkey,
    pub budget: u64,
    pub total_tasks: u64,
    pub tasks_completed: u64,
    pub is_active: bool,
}

#[account]
#[derive(InitSpace)]
pub struct FreelancerProject {
    #[max_len(50)]
    pub completed_task_url: String,
    #[max_len(50)]
    pub project_name: String,
    pub project_client: Pubkey,
    pub approved_tasks: u64,
    pub rejected_attempts: u64,
    pub is_active: bool,
}

#[account]
pub struct Vault {}
