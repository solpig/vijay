use anchor_lang::prelude::*;

use super::{ClientReportCard, Escrow, FreelancerProject, FreelancerReportCard, Project};
use crate::error_codes::ErrorCode;

pub fn transfer_project(ctx: Context<TransferInfo>, freelancer: Pubkey, freelancer_project_id: u64) -> Result<()> {
    
    // assign the new freelancer to the project
    let project = &mut ctx.accounts.project;
    project.assigned_freelancer = freelancer;
    project.assigned_freelancer_project_id = freelancer_project_id;
    
    // update the escrow receiver to transfer the amount on task completion to newly assigned freelancer
    let escrow = &mut ctx.accounts.escrow;
    escrow.receiver = freelancer;

    // set the last freelancer project account as inactive
    let freelancer_project = &mut ctx.accounts.freelancer_project;
    freelancer_project.is_active = false;

    // update the last freelancer's performance
    let freelancer_report = &mut ctx.accounts.freelancer_report;
    freelancer_report.rejected = freelancer_report.rejected.checked_add(1).ok_or(ErrorCode::NumericalOverflow)?;
    freelancer_report.projects_in_progress = freelancer_report.projects_in_progress.checked_sub(1).ok_or(ErrorCode::NumericalOverflow)?;
    // skipping the in progress projects for risk_score calculation
    let completed_projects = freelancer_report.total_projects.checked_sub(freelancer_report.projects_in_progress).ok_or(ErrorCode::NumericalOverflow)?;
    freelancer_report.risk_score = ((freelancer_report.rejected * 10000) / completed_projects) as u16;

     // set the client performance report card
     let client_report_card = &mut ctx.accounts.client_report_card;
     client_report_card.transferred = client_report_card.transferred.checked_add(1).ok_or(ErrorCode::NumericalOverflow)?;
     client_report_card.projects_in_progress = client_report_card.projects_in_progress.checked_sub(1).ok_or(ErrorCode::NumericalOverflow)?;
     let total_risk_points = client_report_card.transferred + client_report_card.withdrawn;
     client_report_card.risk_score = ((total_risk_points * 10000) / client_report_card.completed) as u16; 

    Ok(())
}

#[derive(Accounts)]
#[instruction(project_id: u64)]
pub struct TransferInfo<'info> {
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"client_project", project_id.to_le_bytes().as_ref(), signer.key().as_ref()],
        bump
    )]
    pub project: Account<'info, Project>,

    #[account(
        mut,
        seeds = [b"project_escrow", project.name.as_bytes().as_ref(), project.owner.as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(
        mut,
        seeds = [b"freelancer_project", project.name.as_bytes().as_ref(), project.assigned_freelancer_project_id.to_le_bytes().as_ref(), project.assigned_freelancer.as_ref()],
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
    pub client_report_card: Account<'info, ClientReportCard>
}