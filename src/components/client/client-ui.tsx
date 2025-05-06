'use client'

import { PublicKey } from '@solana/web3.js'
import { useState } from 'react'
import { useClientAccounts } from './client-data-access'
import { ProgramAccount } from '@coral-xyz/anchor'

export function RegisterClient({ address }: { address: PublicKey }) {
  const { initializeClientMutation, queryClientAccount } = useClientAccounts({ account: address })

  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [contact, setContact] = useState('');

  const initializeClientMut = initializeClientMutation(() => {
    queryClientAccount.refetch();
    setName('');
    setDomain('');
    setRequiredSkills('');
    setContact('');
  });

    return (
      <div>
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
      </div>
    )
}

export function ClientsList({ address }: { address: PublicKey }) {
  const { queryClientAccounts } = useClientAccounts({ account: address });

  return (
    <div className="max-w-16xl mx-auto mr-16 mt-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {queryClientAccounts.data?.map((account) => (
          <ClientCard account={account} />
        ))}
      </div>
    </div>
  )
}

function ClientCard({ account }: { account: ProgramAccount }) {

  const  clientDetails = account.account;

  return (
    <div className="max-w-md w-full mx-auto rounded-3xl shadow-lg bg-gradient-to-br from-white to-slate-50 p-6 space-y-4 border border-gray-200">
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


// function VijayCard({ account }: { account: PublicKey }) {
//   const { queryFreelancerAccount: accountQuery, incrementMutation, setMutation, decrementMutation, closeMutation } = useFreelancerAccounts({
//     account,
//   })

//   const count = useMemo(() => accountQuery.data?.count ?? 0, [accountQuery.data?.count])

//   return accountQuery.isLoading ? (
//     <span className="loading loading-spinner loading-lg"></span>
//   ) : (
//     <div className="card card-bordered border-base-300 border-4 text-neutral-content">
//       <div className="card-body items-center text-center">
//         <div className="space-y-6">
//           <h2 className="card-title justify-center text-3xl cursor-pointer" onClick={() => accountQuery.refetch()}>
//             {count}
//           </h2>
//           <div className="card-actions justify-around">
//             <button
//               className="btn btn-xs lg:btn-md btn-outline"
//               onClick={() => incrementMutation.mutateAsync()}
//               disabled={incrementMutation.isPending}
//             >
//               Increment
//             </button>
//             <button
//               className="btn btn-xs lg:btn-md btn-outline"
//               onClick={() => {
//                 const value = window.prompt('Set value to:', count.toString() ?? '0')
//                 if (!value || parseInt(value) === count || isNaN(parseInt(value))) {
//                   return
//                 }
//                 return setMutation.mutateAsync(parseInt(value))
//               }}
//               disabled={setMutation.isPending}
//             >
//               Set
//             </button>
//             <button
//               className="btn btn-xs lg:btn-md btn-outline"
//               onClick={() => decrementMutation.mutateAsync()}
//               disabled={decrementMutation.isPending}
//             >
//               Decrement
//             </button>
//           </div>
//           <div className="text-center space-y-4">
//             <p>
//               <ExplorerLink path={`account/${account}`} label={ellipsify(account.toString())} />
//             </p>
//             <button
//               className="btn btn-xs btn-secondary btn-outline"
//               onClick={() => {
//                 if (!window.confirm('Are you sure you want to close this account?')) {
//                   return
//                 }
//                 return closeMutation.mutateAsync()
//               }}
//               disabled={closeMutation.isPending}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
