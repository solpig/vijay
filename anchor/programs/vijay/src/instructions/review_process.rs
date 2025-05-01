use anchor_lang::prelude::*;

use crate::error_codes::ErrorCode;

use super::{Escrow, FreelancerProject, FreelancerReportCard, Project, Vault};

pub fn review_task_process(
    ctx: Context<TaskReviewProcess>,
    _project_id: u64,
    approve: bool,
) -> Result<()> {
    require!(
        ctx.accounts.signer.key() == ctx.accounts.project.owner,
        ErrorCode::UnAuthorizedReviewer
    );
    let freelancer_project = &mut ctx.accounts.freelancer_project;
    freelancer_project.completed_task_url = "".to_string();
    match approve {
        true => {
            // make the payment from vault account
            let escrow = &mut ctx.accounts.escrow;
            require!(escrow.is_active, ErrorCode::EscrowInActive);
            require!(escrow.tasks_completed < escrow.total_tasks, ErrorCode::TasksCompleted);

            let amount_per_task = escrow.amount / escrow.total_tasks;

            **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? = ctx.accounts.vault.to_account_info().lamports().checked_sub(amount_per_task).ok_or(ErrorCode::NumericalOverflow)?;
            **ctx.accounts.receiver.to_account_info().try_borrow_mut_lamports()? = ctx.accounts.vault.to_account_info().lamports().checked_add(amount_per_task).ok_or(ErrorCode::NumericalOverflow)?;

            escrow.tasks_completed = escrow.tasks_completed.checked_add(1).ok_or(ErrorCode::NumericalOverflow)?;

            // in case all tasks are completed mark escrow as inactive
            // also calculate and finalize the freelancer performance
            if escrow.tasks_completed == escrow.total_tasks {
                escrow.is_active = false;
                let freelancer_report = &mut ctx.accounts.freelancer_report_card;
                freelancer_report.completed = freelancer_report.completed.checked_add(1).ok_or(ErrorCode::NumericalOverflow)?;
                freelancer_report.success_rate = ((freelancer_report.completed * 10000)/ freelancer_report.total_projects) as u16;
            }

            let approved_tasks = freelancer_project
            .approved_tasks
            .checked_add(1)
            .ok_or(ErrorCode::NumericalOverflow)?;
            freelancer_project.approved_tasks = approved_tasks;

        }
        false => {
            let rejected_tasks = freelancer_project
                .rejected_tasks
                .checked_add(1)
                .ok_or(ErrorCode::NumericalOverflow)?;
            freelancer_project.rejected_tasks = rejected_tasks;
        }
    }
    Ok(())
}

#[derive(Accounts)]
#[instruction(project_id: u64)]
pub struct TaskReviewProcess<'info> {
    pub signer: Signer<'info>,

    #[account(
        seeds = [b"client_project", project_id.to_le_bytes().as_ref(), signer.key().as_ref()],
        bump
    )]
    pub project: Account<'info, Project>,

    #[account(
        mut,
        seeds = [b"freelancer_project", project.name.as_bytes().as_ref(), project.assigned_freelancer_project_id.to_le_bytes().as_ref(), project.assigned_freelancer.as_ref()],
        bump
    )]
    pub freelancer_project: Account<'info, FreelancerProject>,

    #[account(
        mut,
        seeds = [b"project_escrow", project.name.as_bytes().as_ref(), project.owner.as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(
        mut,
        seeds = [b"vault", project.name.as_bytes().as_ref(), project.owner.as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,


    #[account(
        mut,
        seeds = [b"freelancer_report", project.assigned_freelancer.as_ref()],
        bump,
    )]
    pub freelancer_report_card: Account<'info, FreelancerReportCard>,

    /// CHECK: receiver is same as the one set under escrow account, required to transfer SOL
    #[account(mut, address = escrow.receiver)]
    pub receiver: AccountInfo<'info>,
}
