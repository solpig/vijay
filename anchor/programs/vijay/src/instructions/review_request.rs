use anchor_lang::prelude::*;

use super::FreelancerProject;

pub fn request_task_review(
    ctx: Context<TaskReviewInfo>,
    _project_name: String,
    _freelancer_project_id: u64,
    url: String,
) -> Result<()> {
    let freelancer_project = &mut ctx.accounts.freelancer_project;
    freelancer_project.completed_task_url = url;
    // emit the event here
    Ok(())
}

#[derive(Accounts)]
#[instruction(project_name: String, freelancer_project_id: u64)]
pub struct TaskReviewInfo<'info> {
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"freelancer_project", project_name.as_bytes().as_ref(), freelancer_project_id.to_le_bytes().as_ref(), signer.key().as_ref()],
        bump
    )]
    freelancer_project: Account<'info, FreelancerProject>,
}
