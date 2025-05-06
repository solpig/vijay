import { PublicKey } from "@solana/web3.js";
import { useState } from "react";
import { useFreelancerAccounts } from "./freelancer-data-access";


export function RegisterFreelancer({ address }: { address: PublicKey }) {
    const { initializeFreelancerMutation, queryFreelancerAccount } = useFreelancerAccounts({ account: address })
  
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
    console.log("queryFreelancerAccount", queryFreelancerAccount);
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
          onClick={() => initializeFreelancerMut.mutateAsync({name, domain, skills, contact})}
          disabled={initializeFreelancerMut.isPending || queryFreelancerAccount.data?.name !== undefined}>
          {!queryFreelancerAccount.data?.name ? "Create" : "Already Registered"}{initializeFreelancerMut.isPending && '...'}
        </button>
        </div>
      )
}