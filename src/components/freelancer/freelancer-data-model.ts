import { Keypair } from "@solana/web3.js";

export interface initializeFreelancer {
    name: string;
    domain: string;
    skills: string;
    contact: string;
}

export interface requestTaskReview {
    projectID: number;
    projectName: string;
    taskURL: string;
    keypair: Keypair;
  }
  