'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { AppHero } from '../ui/ui-layout'
import { useProgramAccounts } from './client-data-access'
import { ClientsList } from './client-ui'

export default function ClientsFeature() {
  const { publicKey } = useWallet()

  return publicKey ? (
    <div>
      <AppHero title="Clients" subtitle={'Clients registered on platform'}>
      <ClientsList address={publicKey} />
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
