use anchor_lang::prelude::*;

use crate::error_codes::ErrorCode;

use super::{ClientReportCard, Escrow, FreelancerProject, FreelancerReportCard, Project, Vault};

pub fn review_task_process(
    ctx: Context<TaskReviewProcess>,
    _project_id: u64,
    approve: bool,
) -> Result<()> {
    require!(
        ctx.accounts.signer.key() == ctx.accounts.project.owner,
        ErrorCode::UnAuthorizedReviewer
    );

    require!(
        ctx.accounts.freelancer_project.completed_task_url != "",
        ErrorCode::TaskReviewNotRequested
    );

    let client_project = &mut ctx.accounts.project;
    client_project.task_in_review = String::new();

    let freelancer_project = &mut ctx.accounts.freelancer_project;
    freelancer_project.completed_task_url = String::new();

    match approve {
        true => {
            // make the payment from vault account
            let escrow = &mut ctx.accounts.escrow;
            require!(escrow.is_active, ErrorCode::EscrowInActive);
            require!(escrow.tasks_completed < escrow.total_tasks, ErrorCode::TasksCompleted);

            let amount_per_task = escrow.budget / escrow.total_tasks;

            **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? = ctx.accounts.vault.to_account_info().lamports().checked_sub(amount_per_task).ok_or(ErrorCode::NumericalOverflow)?;
            **ctx.accounts.receiver.to_account_info().try_borrow_mut_lamports()? = ctx.accounts.receiver.to_account_info().lamports().checked_add(amount_per_task).ok_or(ErrorCode::NumericalOverflow)?;

            escrow.amount_paid = escrow.amount_paid.checked_add(amount_per_task).ok_or(ErrorCode::NumericalOverflow)?;
            escrow.tasks_completed = escrow.tasks_completed.checked_add(1).ok_or(ErrorCode::NumericalOverflow)?;

            let approved_tasks = freelancer_project
            .approved_tasks
            .checked_add(1)
            .ok_or(ErrorCode::NumericalOverflow)?;
            freelancer_project.approved_tasks = approved_tasks;

            // in case all tasks are completed mark escrow as inactive
            if escrow.tasks_completed == escrow.total_tasks {
                escrow.is_active = false;
                freelancer_project.is_active = false;

                let project  = &mut ctx.accounts.project;
                project.is_active = false;
                project.in_progress = false;
                
                // also calculate and finalize the freelancer and client's performance
                let freelancer_report = &mut ctx.accounts.freelancer_report_card;
                freelancer_report.completed = freelancer_report.completed.checked_add(1).ok_or(ErrorCode::NumericalOverflow)?;
                freelancer_report.projects_in_progress = freelancer_report.projects_in_progress.checked_sub(1).ok_or(ErrorCode::NumericalOverflow)?;
                
                let actual_total_projects = freelancer_report.total_projects.checked_sub(freelancer_report.projects_in_progress).ok_or(ErrorCode::NumericalOverflow)?;
                freelancer_report.success_rate = ((freelancer_report.completed * 10000)/ actual_total_projects) as u16;
                freelancer_report.risk_score = ((freelancer_report.rejected * 10000) / actual_total_projects) as u16;

                let client_report_card = &mut ctx.accounts.client_report_card;
                client_report_card.completed = client_report_card.completed.checked_add(1).ok_or(ErrorCode::NumericalOverflow)?;
                client_report_card.projects_in_progress = client_report_card.projects_in_progress.checked_sub(1).ok_or(ErrorCode::NumericalOverflow)?;
                
                // not considering the in progress projects for calculating success_rate
                let actual_total_projects = client_report_card.total_projects.checked_sub(client_report_card.projects_in_progress).ok_or(ErrorCode::NumericalOverflow)?;
                client_report_card.success_rate = ((client_report_card.completed * 10000) / actual_total_projects) as u16;
                
                let total_risk_points = client_report_card.withdrawn + client_report_card.transferred;
                client_report_card.risk_score = ((total_risk_points * 10000) / actual_total_projects) as u16;
            }

        }
        false => {
            let rejected_tasks = freelancer_project
                .rejected_attempts
                .checked_add(1)
                .ok_or(ErrorCode::NumericalOverflow)?;
            freelancer_project.rejected_attempts = rejected_tasks;
        }
    }
    Ok(())
}

#[derive(Accounts)]
#[instruction(project_id: u64)]
pub struct TaskReviewProcess<'info> {
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"client_project", project_id.to_le_bytes().as_ref(), signer.key().as_ref()],
        bump
    )]
    pub project: Account<'info, Project>,

    #[account(
        mut,
        seeds = [b"freelancer_project", project.assigned_freelancer_project_id.to_le_bytes().as_ref(), project.assigned_freelancer.as_ref()],
        bump
    )]
    pub freelancer_project: Account<'info, FreelancerProject>,

    #[account(
        mut,
        seeds = [b"project_escrow", project_id.to_le_bytes().as_ref(), project.owner.as_ref()],
        bump
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
        seeds = [b"freelancer_report", project.assigned_freelancer.as_ref()],
        bump,
    )]
    pub freelancer_report_card: Account<'info, FreelancerReportCard>,


    #[account(
        mut,
        seeds = [b"client_report", signer.key().as_ref()],
        bump,
    )]
    pub client_report_card: Account<'info, ClientReportCard>,

    /// CHECK: receiver is same as the one set under escrow account, required to transfer SOL
    #[account(mut, address = escrow.receiver)]
    pub receiver: UncheckedAccount<'info>,
}
