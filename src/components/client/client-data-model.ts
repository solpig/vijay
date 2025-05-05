import { Keypair } from "@solana/web3.js";

export interface initializeClient {
    name: string;
    domain: string;
    requiredSkills: string;
    contact: string;
} 

export interface initializeFreelancer {
    name: string;
    domain: string;
    skills: string;
    contact: string;
    keypair: Keypair;
}

export interface requestTaskReview {
  projectID: number;
  projectName: string;
  taskURL: string;
  keypair: Keypair;
}

export interface processTaskReview {
    projectID: number;
    approval: boolean;
    keypair: Keypair;
}

export interface initializeProject {
  name: string;
  description: string;
  url: string;
  budget: number;
  keypair: Keypair;
}

export interface projectEscrowSetup {
    projectID: number;
    freelancer: Keypair;
    budget: number;
    totalTasks: number;
    keypair: Keypair;
}

export interface cancelProject {
    projectID: number;
    keypair: Keypair;
}

export interface transferProject {
    projectID: number;
    newFreelancer: Keypair;
    keypair: Keypair;
}