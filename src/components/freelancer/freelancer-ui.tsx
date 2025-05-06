import { PublicKey } from "@solana/web3.js";
import { useState } from "react";
import { useFreelancerAccounts } from "./freelancer-data-access";


export function RegisterFreelancer({ address }: { address: PublicKey }) {
    const { initializeFreelancerMutation, queryFreelancerAccount } = useFreelancerAccounts({ account: address })
  
    const [name, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [skills, setSkills] = useState('');
    const [contact, setContact] = useState('');
  
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
          onClick={() => initializeFreelancerMutation.mutateAsync({name, domain, skills, contact})}
          disabled={initializeFreelancerMutation.isPending || queryFreelancerAccount.data?.name !== undefined}>
          {!queryFreelancerAccount.data?.name ? "Create" : "Already Registered"}{initializeFreelancerMutation.isPending && '...'}
        </button>
        </div>
      )  
    // return (
    //   <div className="card-body items-center text-center">
    //     <div className="bg-white rounded-2xl shadow p-8 grid gap-2">
    //       <h2 className="card-title justify-center text-3xl cursor-pointer" onClick={() => queryClientAccount.refetch()}>
    //         {queryClientAccount.data?.name}
    //       </h2>
    //         <p className="text-base text-gray-800">
    //           Domain: {queryClientAccount.data?.domain}
    //         </p>
    //         <p className="text-base text-gray-800">
    //           Required Skills: {queryClientAccount.data?.requiredSkills}
    //         </p>
    //         <p className="text-base text-gray-800">
    //           Contact: {queryClientAccount.data?.contact}
    //         </p>
    //     </div>
    //   </div>
    // )
}