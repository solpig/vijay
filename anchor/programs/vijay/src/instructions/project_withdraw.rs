use anchor_lang::prelude::*;

use crate::error_codes::ErrorCode;

use super::{ClientReportCard, Escrow, FreelancerProject, FreelancerReportCard, Project, Vault};

pub fn withdraw_project(ctx: Context<WithdrawInfo>, _project_id: u64) -> Result<()> {
    // in-activate the project account
    // escrow account has been closed under #[derive(Accounts)] so no change required there
    let project = &mut ctx.accounts.project;
    require!(project.owner == ctx.accounts.signer.key(), ErrorCode::NotAnOwner);
    require!(project.is_active, ErrorCode::ProjectInActive);

    project.is_active = false;
    project.in_progress = false;
    
    // in-activate the freelancer project account
    let freelancer_project = &mut ctx.accounts.freelancer_project;
    require!(freelancer_project.is_active, ErrorCode::FreelancerProjectInActive);
    freelancer_project.is_active = false;
    // close the task reviews if any
    freelancer_project.completed_task_url = String::new();
    project.task_in_review = String::new();
    
    // transfer the SOL and close the vault account
    let remaining_lamports = ctx.accounts.vault.to_account_info().lamports();
    **ctx.accounts.vault.to_account_info().lamports.borrow_mut() = 0;
    **ctx.accounts.signer.to_account_info().try_borrow_mut_lamports()? = ctx.accounts.signer.to_account_info().lamports()
            .checked_add(remaining_lamports)
            .ok_or(ErrorCode::NumericalOverflow)?;

    // set the freelancer performance report card
    let freelancer_report = &mut ctx.accounts.freelancer_report_card;
    freelancer_report.rejected = freelancer_report.rejected.checked_add(1).ok_or(ErrorCode::NumericalOverflow)?;
    freelancer_report.projects_in_progress = freelancer_report.projects_in_progress.checked_sub(1).ok_or(ErrorCode::NumericalOverflow)?;
    // skipping the in progress projects for risk_score calculation
    let mut completed_projects = freelancer_report.total_projects.checked_sub(freelancer_report.projects_in_progress).ok_or(ErrorCode::NumericalOverflow)?;
    if completed_projects == 0 {
        completed_projects = 1;
     } 
    freelancer_report.risk_score = ((freelancer_report.rejected * 10000) / completed_projects) as u16;
    freelancer_report.success_rate = ((freelancer_report.completed * 10000)/ completed_projects) as u16;

    // set the client performance report card
    let client_report_card = &mut ctx.accounts.client_report_card;
    client_report_card.withdrawn = client_report_card.withdrawn.checked_add(1).ok_or(ErrorCode::NumericalOverflow)?;
    client_report_card.projects_in_progress = client_report_card.projects_in_progress.checked_sub(1).ok_or(ErrorCode::NumericalOverflow)?;
    
    let mut actual_total_projects = client_report_card.total_projects.checked_sub(client_report_card.projects_in_progress).ok_or(ErrorCode::NumericalOverflow)?;
    if actual_total_projects == 0 {
        actual_total_projects = 1;
    } 
    client_report_card.success_rate = ((client_report_card.completed * 10000) / actual_total_projects) as u16;
    
    let total_risk_points = client_report_card.withdrawn + client_report_card.transferred;
    let total_finished_projects = total_risk_points + client_report_card.completed;
    client_report_card.risk_score = ((total_risk_points * 10000) / total_finished_projects) as u16;
    Ok(())
}


#[derive(Accounts)]
#[instruction(project_id: u64)]
pub struct WithdrawInfo<'info> {

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
        seeds = [b"project_escrow", project_id.to_le_bytes().as_ref(), project.owner.as_ref()],
        bump,
        close = signer
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(
        mut,
        seeds = [b"vault", project_id.to_le_bytes().as_ref(), project.owner.as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,


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
    pub freelancer_report_card: Account<'info, FreelancerReportCard>,

    #[account(
        mut,
        seeds = [b"client_report", signer.key().as_ref()],
        bump,
    )]
    pub client_report_card: Account<'info, ClientReportCard>
}
