'use client'

import { PublicKey } from "@solana/web3.js";
import { useState } from "react";
import { useFreelancerAccounts } from "./freelancer-data-access";
import { ProgramAccount } from "@coral-xyz/anchor";
import { useRouter } from 'next/navigation';


export function RegisterFreelancer({ address }: { address: PublicKey }) {
    const { InitializeFreelancerMutation: initializeFreelancerMutation, queryFreelancerAccount } = useFreelancerAccounts({ account: address })
  
    const [name, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [skills, setSkills] = useState('');
    const [contact, setContact] = useState('');

    const initializeFreelancerMut = initializeFreelancerMutation(() => {
      queryFreelancerAccount.refetch();
      setName('');
      setDomain('');
      setSkills('');
      setContact('');
    });
      return (
        <div>
          <p>Freelancer Registeration</p>
          <input
            type="text"
            placeholder="Name"
            className="input input-bordered w-full mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Domain"
            className="input input-bordered w-full mb-4"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
          <input
            type="text"
            placeholder="Skills"
            className="input input-bordered w-full mb-4"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
          <input
            type="text"
            placeholder="Contact Details"
            className="input input-bordered w-full mb-4"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        <button
          className="btn btn-xs lg:btn-md btn-primary btn-outline"
          onClick={() => initializeFreelancerMut.mutateAsync({name, domain, skills, contact})}
          disabled={initializeFreelancerMut.isPending || queryFreelancerAccount.data?.name !== undefined}>
          {!queryFreelancerAccount.data?.name ? "Create" : "Already Registered"}{initializeFreelancerMut.isPending && '...'}
        </button>
        </div>
      )
}

export function FreelancersList({ address }: { address: PublicKey }) {
  const { queryFreelancerAccounts } = useFreelancerAccounts({ account: address });

  return (
    <div className="max-w-16xl mx-auto mr-16 mt-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {queryFreelancerAccounts.data?.map((account, i) => (
          <FreelancerCard key={i} account={account} />
        ))}
      </div>
    </div>
  )
}

function FreelancerCard({ account }: { account: ProgramAccount }) {
  const router = useRouter();
  const  freelancerDetails = account.account;
  const handleClick = () => {
    if (freelancerDetails?.owner) {
      router.push(`/freelancer/${freelancerDetails.owner.toString()}`);
    }
  };
  
  return (
    <div onClick={handleClick} className="max-w-md w-full mx-auto rounded-3xl shadow-lg bg-gradient-to-br 
                        from-white to-slate-50 p-6 space-y-4 border border-gray-200
                        cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-2xl">
      <h2 className="text-2xl font-semibold text-center text-indigo-600">
        {freelancerDetails.name}
      </h2>
      <div className="space-y-2 text-gray-700 text-sm truncate overflow-hidden whitespace-nowrap">
        <p>
          <span className="font-medium text-gray-900">Domain:</span> {freelancerDetails.domain}
        </p>
        <p>
          <span className="font-medium text-gray-900">Skills:</span> {freelancerDetails.skills}
        </p>
        <p>
          <span className="font-medium text-gray-900">Contact:</span> {freelancerDetails.contact}
        </p>
      </div>
    </div>
  )
}