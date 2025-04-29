#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("HQY5kLNtUJkEiArKxDyrkCKHBtK8pDFGUBifrGFjtLDt");


pub mod instructions;
pub use instructions::*;

#[program]
pub mod vijay {
    use super::*;

    pub fn client_init(ctx: Context<ClientInfo>, 
      name: String, 
      domain: String, 
      required_skills: String, 
      contact_details: String) -> Result<()> {
      instructions::handler(ctx, name, domain, required_skills, contact_details)
    }
}
