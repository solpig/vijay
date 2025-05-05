'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { useMemo, useState } from 'react'
import { ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useClientAccounts, useFreelancerAccounts } from './client-data-access'

export function CreateClient({ address }: { address: PublicKey }) {
  const { initializeClientMutation, queryClientAccount } = useClientAccounts({ account: address })

  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [contact, setContact] = useState('');

  if (!queryClientAccount.data?.name) {
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
        onClick={() => initializeClientMutation.mutateAsync({name, domain, requiredSkills, contact})}
        disabled={initializeClientMutation.isPending}>
        Create {initializeClientMutation.isPending && '...'}
      </button>
      </div>
    )
  }

  return (
    <div className="card-body items-center text-center">
      <div className="bg-white rounded-2xl shadow p-8 grid gap-2">
        <h2 className="card-title justify-center text-3xl cursor-pointer" onClick={() => queryClientAccount.refetch()}>
          {queryClientAccount.data?.name}
        </h2>
          <p className="text-base text-gray-800">
            Domain: {queryClientAccount.data?.domain}
          </p>
          <p className="text-base text-gray-800">
            Required Skills: {queryClientAccount.data?.requiredSkills}
          </p>
          <p className="text-base text-gray-800">
            Contact: {queryClientAccount.data?.contact}
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
