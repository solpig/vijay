'use client'

import { PublicKey } from '@solana/web3.js'
import { useState } from 'react'
import { useClientAccounts } from './client-data-access'
import { ProgramAccount } from '@coral-xyz/anchor'
import { useRouter } from 'next/navigation';

export function RegisterClient({ address }: { address: PublicKey }) {
  const { useInitializeClientMutation, queryClientAccount, newProjectMutation } = useClientAccounts({ account: address })

  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [contact, setContact] = useState('');

  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectURL, setProjectURL] = useState('');
  const [projectBudget, setprojectBudget] = useState(0);

  const initializeClientMut = useInitializeClientMutation(() => {
    queryClientAccount.refetch();
    setName('');
    setDomain('');
    setRequiredSkills('');
    setContact('');
  });

    return (
      <div>
        <p>Client Registeration</p>
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
          placeholder="Required Skills"
          className="input input-bordered w-full mb-4"
          value={requiredSkills}
          onChange={(e) => setRequiredSkills(e.target.value)}
        />
        <input
          type="text"
          placeholder="Contact"
          className="input input-bordered w-full mb-4"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
        <button
          className="btn btn-xs lg:btn-md btn-primary btn-outline"
          onClick={() => initializeClientMut.mutateAsync({name, domain, requiredSkills, contact})}
          disabled={initializeClientMut.isPending || queryClientAccount.data?.name !== undefined}>
          {!queryClientAccount.data?.name ? "Create" : "Already Registered"}{initializeClientMut.isPending && '...'}
        </button>
        {queryClientAccount.data?.name && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Publish a job to get started!
            </p>
            <input
              type="text"
              placeholder="Project name"
              className="input input-bordered w-full mb-4"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Description"
              className="input input-bordered w-full mb-4"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
            <input
              type="text"
              placeholder="URL"
              className="input input-bordered w-full mb-4"
              value={projectURL}
              onChange={(e) => setProjectURL(e.target.value)}
            />
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Budget (in SOL)"
              className="input input-bordered w-full mb-4"
              value={projectBudget}
              onChange={(e) => setprojectBudget(Number(e.target.value))}
            />
            <button
              className="btn btn-xs lg:btn-md btn-primary btn-outline"
              onClick={() => newProjectMutation.mutateAsync({name, description: projectDescription, url: projectURL, budget: projectBudget})} 
              disabled={newProjectMutation.isPending}>
              Publish{newProjectMutation.isPending && '...'}
            </button>
          </div>
        )}

      </div>
    )
}



export function ClientsList({ address }: { address: PublicKey }) {
  const { queryClientAccounts } = useClientAccounts({ account: address });

  return (
    <div className="max-w-16xl mx-auto mr-16 mt-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {queryClientAccounts.data?.map((account, i) => (
          <ClientCard key={i} account={account} />
        ))}
      </div>
    </div>
  )
}

function ClientCard({ account }: { account: ProgramAccount }) {
  const router = useRouter();
  const  clientDetails = account.account;
  const handleClick = () => {
    if (clientDetails?.owner) {
      router.push(`/client/${clientDetails.owner.toString()}`);
    }
  };

  return (
    <div onClick={handleClick} className="max-w-md w-full mx-auto rounded-3xl shadow-lg bg-gradient-to-br 
                    from-white to-slate-50 p-6 space-y-4 border border-gray-200
                    cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-2xl">
      <h2 className="text-2xl font-semibold text-center text-indigo-600">
        {clientDetails.name}
      </h2>
      <div className="space-y-2 text-gray-700 text-sm truncate overflow-hidden whitespace-nowrap">
        <p>
          <span className="font-medium text-gray-900">Domain:</span> {clientDetails.domain}
        </p>
        <p>
          <span className="font-medium text-gray-900">Required Skills:</span> {clientDetails.requiredSkills}
        </p>
        <p>
          <span className="font-medium text-gray-900">Contact:</span> {clientDetails.contact}
        </p>
      </div>
    </div>
  )
}
