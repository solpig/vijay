'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { AppHero, ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useProgramAccounts } from '../client/client-data-access'
import { RegisterFreelancer } from './freelancer-ui'

export default function FreelancerFeature() {
  const { publicKey } = useWallet()
  const { programId } = useProgramAccounts()

  return publicKey ? (
    <div>
      <AppHero
        title="Vijay"
        subtitle={
          'A decentralised freelancing decentralized freelancing platform on Solana'
        }>
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
        <RegisterFreelancer address={publicKey} />
      </AppHero>
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  )
}
