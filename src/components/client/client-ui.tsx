'use client'

import { PublicKey } from '@solana/web3.js'
import { useState } from 'react'
import { useClientAccounts } from './client-data-access'
import { ProgramAccount } from '@coral-xyz/anchor'
import { useRouter } from 'next/navigation';

export function RegisterClient({ address }: { address: PublicKey }) {
  const { InitializeClientMutation, queryClientAccount, NewProjectMutation } = useClientAccounts({ account: address })

  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [contact, setContact] = useState('');

  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectURL, setProjectURL] = useState('');
  const [projectBudget, setprojectBudget] = useState(0);

  const initializeClientMut = InitializeClientMutation(() => {
    queryClientAccount.refetch();
    setName('');
    setDomain('');
    setRequiredSkills('');
    setContact('');
  });

  const newProjectMut = NewProjectMutation(() => {
    queryClientAccount.refetch();
    setProjectName('');
    setProjectDescription('');
    setProjectURL('');
    setprojectBudget(0);
  });

  const isProjectFormValid = () => {
    if (projectName.length < 1 || projectDescription.length < 1 || projectURL.length < 1 || projectBudget <= 0) {
      return false;
    }
    return true;
  }

  const isClientFormValid = () => {
    if (name.length < 1 || domain.length < 1 || requiredSkills.length < 1 || contact.length < 1) {
      return false;
    }
    return true;
  }

    return (
      <div>
        <p className="mb-4" >Client Registeration</p>
        <p className="text-sm text-gray-500 mb-4">
          Register as a client to publish jobs and hire freelancers. Registeration fees is 1 SOL to be paid in the form of a transaction fee.
        </p>
        <input
          id='client-name'
          type="text"
          placeholder="Name"
          className="input input-bordered w-full mb-4"
          value={name}
          maxLength={50}
          required
          disabled={queryClientAccount.data?.name !== undefined}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          id='client-domain'
          type="text"
          placeholder="Domain"
          className="input input-bordered w-full mb-4"
          maxLength={50}
          required
          value={domain}
          disabled={queryClientAccount.data?.name !== undefined}
          onChange={(e) => setDomain(e.target.value)}
        />
        <input
          id='client-required-skills'
          type="text"
          placeholder="Required Skills"
          className="input input-bordered w-full mb-4"
          maxLength={240}
          required
          value={requiredSkills}
          disabled={queryClientAccount.data?.name !== undefined}
          onChange={(e) => setRequiredSkills(e.target.value)}
        />
        <input
          id='client-contact'
          type="text"
          placeholder="Contact"
          className="input input-bordered w-full mb-4"
          maxLength={50}
          required
          value={contact}
          disabled={queryClientAccount.data?.name !== undefined}
          onChange={(e) => setContact(e.target.value)}
        />
        <button
          id='client-register-button'
          className="btn btn-xs lg:btn-md btn-primary btn-outline"
          onClick={() => initializeClientMut.mutateAsync({name, domain, requiredSkills, contact})}
          disabled={initializeClientMut.isPending || queryClientAccount.data?.name !== undefined || !isClientFormValid()}>
          {!queryClientAccount.data?.name ? "Create" : "Already Registered"}{initializeClientMut.isPending && '...'}
        </button>
        {queryClientAccount.data?.name && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-4 mt-12">
              Publish a job to get started!
            </p>
            <input
              id='client-project-name'
              type="text"
              placeholder="Project name"
              className="input input-bordered w-full mb-4"
              maxLength={32}
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <input
              id='client-project-description'
              type="text"
              placeholder="Description"
              maxLength={280}
              required
              className="input input-bordered w-full mb-4"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
            <input
              id='client-project-url'
              type="text"
              placeholder="URL"
              className="input input-bordered w-full mb-4"
              value={projectURL}
              maxLength={50}
              required
              onChange={(e) => setProjectURL(e.target.value)}
            />
            <input
              id='client-project-budget'
              type="number"
              min="0"
              step="1"
              placeholder="Estimated Budget (in SOL)"
              className="input input-bordered w-full mb-4"
              value={projectBudget === 0 ? '' : projectBudget}
              onChange={(e) => setprojectBudget(Number(e.target.value))}
            />
            <button
              id='client-project-publish-button'
              className="btn btn-xs lg:btn-md btn-primary btn-outline"
              onClick={() => newProjectMut.mutateAsync({name: projectName, description: projectDescription, url: projectURL, budget: projectBudget})} 
              disabled={newProjectMut.isPending || !isProjectFormValid()}>
              Publish{newProjectMut.isPending && '...'}
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
                    cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden h-60">
      <h2 className="text-2xl font-semibold text-center text-indigo-600 overflow-hidden whitespace-nowrap">
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
