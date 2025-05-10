'use client'

import { Keypair, PublicKey } from "@solana/web3.js";

export interface initializeClient {
    name: string;
    domain: string;
    requiredSkills: string;
    contact: string;
} 


export interface processTaskReview {
    projectID: number;
    approval: boolean;
    assignedFreelancer: PublicKey;
    assignedFreelancerProjectID: number;
}

export interface initializeProject {
  name: string;
  description: string;
  url: string;
  budget: number;
}

export interface projectEscrowSetup {
    projectID: number;
    projectName: string;
    freelancer: PublicKey;
    budget: number;
    totalTasks: number;
}

export interface cancelProject {
    projectID: number;
}

export interface transferProject {
    projectID: number;
    newFreelancer: PublicKey;
}