use anchor_lang::prelude::*;

use super::{ClientReportCard, Escrow, Freelancer, FreelancerProject, FreelancerReportCard, Project};
use crate::error_codes::{self, ErrorCode};

pub fn transfer_project(ctx: Context<TransferInfo>, _project_id: u64, new_freelancer_key: Pubkey) -> Result<()> {
    
    require!(
        ctx.accounts.project.owner == ctx.accounts.signer.key(),
        error_codes::ErrorCode::UnAuthorizedSetup
    );

    let new_freelancer = &mut ctx.accounts.new_freelancer;

    // increment the new freelancer project counter
    let counter_increment = new_freelancer
        .project_counter
        .checked_add(1)
        .ok_or(error_codes::ErrorCode::NumericalOverflow)?;
    new_freelancer.project_counter = counter_increment;

    // assign the new freelancer to the project
    let project = &mut ctx.accounts.project;
    project.assigned_freelancer = new_freelancer_key;
    project.assigned_freelancer_project_id = counter_increment;
    // close the task review if any
    project.task_in_review = String::new();
    
    // update the escrow receiver to transfer the budget on task completion to newly assigned freelancer
    let escrow = &mut ctx.accounts.escrow;
    escrow.receiver = new_freelancer_key;

    // setup the new freelancer project
     let new_freelancer_project = &mut ctx.accounts.new_freelancer_project;
     new_freelancer_project.id = counter_increment;
     new_freelancer_project.project_id = project.id;
     new_freelancer_project.amount_paid = 0;
     new_freelancer_project.project_name = project.name.clone();
     new_freelancer_project.project_client = project.owner;
     new_freelancer_project.completed_task_url = String::new();
     new_freelancer_project.approved_tasks = 0;
     new_freelancer_project.rejected_attempts = 0;
     new_freelancer_project.is_active = true;

    // update the new freelancer report card
    let new_freelancer_report = &mut ctx.accounts.new_freelancer_report;
    new_freelancer_report.total_projects = new_freelancer_report.total_projects.checked_add(1).ok_or(ErrorCode::NumericalOverflow)?;
    new_freelancer_report.projects_in_progress = new_freelancer_report.projects_in_progress.checked_add(1).ok_or(ErrorCode::NumericalOverflow)?;

    // set the last freelancer project account as inactive
    let freelancer_project = &mut ctx.accounts.freelancer_project;
    freelancer_project.is_active = false;
    // close the task review if any
    freelancer_project.completed_task_url = String::new();

    // update the last freelancer's performance
    let freelancer_report = &mut ctx.accounts.freelancer_report;
   
    freelancer_report.rejected = freelancer_report.rejected.checked_add(1).ok_or(ErrorCode::NumericalOverflow)?;
    freelancer_report.projects_in_progress = freelancer_report.projects_in_progress.checked_sub(1).ok_or(ErrorCode::NumericalOverflow)?;
   
    // skipping the in progress projects for risk_score calculation
    let completed_projects = freelancer_report.total_projects.checked_sub(freelancer_report.projects_in_progress).ok_or(ErrorCode::NumericalOverflow)?;
    freelancer_report.success_rate = ((freelancer_report.completed * 10000)/ completed_projects) as u16;
    freelancer_report.risk_score = ((freelancer_report.rejected * 10000) / completed_projects) as u16;

     // set the client performance report card
     let client_report = &mut ctx.accounts.client_report;
     client_report.transferred = client_report.transferred.checked_add(1).ok_or(ErrorCode::NumericalOverflow)?;
     
     let actual_total_projects = client_report.total_projects.checked_sub(client_report.projects_in_progress).ok_or(ErrorCode::NumericalOverflow)?;
     client_report.success_rate = ((client_report.completed * 10000) / actual_total_projects) as u16;

     let total_risk_points = client_report.transferred + client_report.withdrawn;
     let total_finished_projects = total_risk_points + client_report.completed;
     client_report.risk_score = ((total_risk_points * 10000) / total_finished_projects) as u16; 

    Ok(())
}

#[derive(Accounts)]
#[instruction(project_id: u64, new_freelancer_key: Pubkey)]
pub struct TransferInfo<'info> {
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
        seeds = [b"freelancer", new_freelancer_key.as_ref()],
        bump
    )]
    pub new_freelancer: Account<'info, Freelancer>,

    #[account(
        mut,
        seeds = [b"project_escrow", project_id.to_le_bytes().as_ref(), project.owner.as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(
        mut,
        seeds = [b"freelancer_project", project.assigned_freelancer_project_id.to_le_bytes().as_ref(), project.assigned_freelancer.as_ref()],
        bump
    )]
    pub freelancer_project: Account<'info, FreelancerProject>,

    #[account(
        mut,
        seeds = [b"freelancer_report", project.assigned_freelancer.as_ref()],
        bump,
    )]
    pub freelancer_report: Account<'info, FreelancerReportCard>,

    #[account(
        mut,
        seeds = [b"client_report", signer.key().as_ref()],
        bump,
    )]
    pub client_report: Account<'info, ClientReportCard>,

    #[account(
        init,
        payer = signer,
        space = 8 + Freelancer::INIT_SPACE,
        seeds = [b"freelancer_project", new_freelancer.project_counter.checked_add(1).unwrap().to_le_bytes().as_ref(), new_freelancer_key.as_ref()],
        bump
    )]
    pub new_freelancer_project: Account<'info, FreelancerProject>,

    #[account(
        mut,
        seeds = [b"freelancer_report", new_freelancer_key.as_ref()],
        bump,
    )]
    pub new_freelancer_report: Account<'info, FreelancerReportCard>,

    pub system_program: Program<'info, System>,
}