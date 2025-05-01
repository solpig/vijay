use anchor_lang::prelude::*;

pub fn initialize_freelancer(
    ctx: Context<FreelancerInfo>,
    name: String,
    domain: String,
    skills: String,
    contact: String,
) -> Result<()> {
    // creating custom freelancer account
    let freelancer = &mut ctx.accounts.freelancer;
    freelancer.name = name;
    freelancer.domain = domain;
    freelancer.skills = skills;
    freelancer.contact = contact;
    freelancer.project_counter = 0;
    freelancer.owner = ctx.accounts.signer.key();

    // creating custom freelancer report card account
    let freelancer_report = &mut ctx.accounts.freelancer_report_card;
    freelancer_report.total_projects = 0;
    freelancer_report.completed = 0;
    freelancer_report.rejected = 0;
    freelancer_report.risk_score = 0;
    freelancer_report.success_rate = 0;
    Ok(())
}

#[derive(Accounts)]
pub struct FreelancerInfo<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        space = 8 + Freelancer::INIT_SPACE,
        payer = signer,
        seeds = [b"freelancer", signer.key().as_ref()],
        bump
    )]
    pub freelancer: Account<'info, Freelancer>,

    #[account(
        init,
        space = 8 + FreelancerReportCard::INIT_SPACE,
        seeds = [b"freelancer_report", signer.key().as_ref()],
        bump,
        payer = signer,
    )]
    pub freelancer_report_card: Account<'info, FreelancerReportCard>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Freelancer {
    #[max_len(50)]
    pub name: String,
    #[max_len(50)]
    pub domain: String,
    #[max_len(100)]
    pub skills: String,
    #[max_len(50)]
    pub contact: String,
    pub project_counter: u64,
    pub owner: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct FreelancerReportCard {
    pub total_projects: u64,
    pub projects_in_progress: u64,
    pub completed: u64,
    pub rejected: u64,
    pub success_rate: u16,
    pub risk_score: u16,
}
