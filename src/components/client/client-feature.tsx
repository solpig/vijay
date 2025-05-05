'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { AppHero, ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useProgramAccounts } from './client-data-access'
import { CreateClient } from './client-ui'

export default function ClientFeature() {
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
        <CreateClient address={publicKey} />
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
