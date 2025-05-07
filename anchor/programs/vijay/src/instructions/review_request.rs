use anchor_lang::prelude::*;

use super::FreelancerProject;

pub fn request_task_review(
    ctx: Context<TaskReviewInfo>,
    project_name: String,
    _freelancer_project_id: u64,
    url: String,
) -> Result<()> {
    let freelancer_project = &mut ctx.accounts.freelancer_project;
    freelancer_project.completed_task_url = url;
    
    emit!(
      ReviewRequested {
        project_name,
        project_owner: freelancer_project.project_client
      }  
    );
    Ok(())
}

#[derive(Accounts)]
#[instruction(project_name: String, freelancer_project_id: u64)]
pub struct TaskReviewInfo<'info> {
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"freelancer_project", freelancer_project_id.to_le_bytes().as_ref(), signer.key().as_ref()],
        bump
    )]
    freelancer_project: Account<'info, FreelancerProject>,
}

#[event]
pub struct ReviewRequested {
    pub project_name: String,
    pub project_owner: Pubkey
}
