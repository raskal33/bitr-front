import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TermsState {
  // Terms acceptance tracking
  acceptedTerms: Record<string, { version: string; timestamp: number }>
  isTermsModalOpen: boolean
  
  // Actions
  openTermsModal: () => void
  closeTermsModal: () => void
  setTermsAccepted: (address: string, version: string) => void
  hasAcceptedTerms: (address: string, requiredVersion?: string) => boolean
  getTermsAcceptance: (address: string) => { version: string; timestamp: number } | null
  clearTermsData: () => void
}

export const useTermsStore = create<TermsState>()(
  persist(
    (set, get) => ({
      // Initial state
      acceptedTerms: {},
      isTermsModalOpen: false,

      // Actions
      openTermsModal: () => {
        console.log('Opening terms modal')
        set({ isTermsModalOpen: true })
      },

      closeTermsModal: () => {
        console.log('Closing terms modal')
        set({ isTermsModalOpen: false })
      },

      setTermsAccepted: (address: string, version: string) => {
        const normalizedAddress = address.toLowerCase()
        console.log(`Recording terms acceptance for ${normalizedAddress}, version ${version}`)
        
        set((state) => ({
          acceptedTerms: {
            ...state.acceptedTerms,
            [normalizedAddress]: {
              version,
              timestamp: Date.now()
            }
          }
        }))
      },

      hasAcceptedTerms: (address: string, requiredVersion?: string) => {
        const normalizedAddress = address.toLowerCase()
        const acceptance = get().acceptedTerms[normalizedAddress]
        
        if (!acceptance) {
          console.log(`No terms acceptance found for ${normalizedAddress}`)
          return false
        }

        // If no specific version required, any acceptance is valid
        if (!requiredVersion) {
          console.log(`Terms accepted for ${normalizedAddress} (version ${acceptance.version})`)
          return true
        }

        // Check if accepted version matches required version
        const hasCorrectVersion = acceptance.version === requiredVersion
        console.log(`Terms version check for ${normalizedAddress}: has ${acceptance.version}, requires ${requiredVersion}, valid: ${hasCorrectVersion}`)
        
        return hasCorrectVersion
      },

      getTermsAcceptance: (address: string) => {
        const normalizedAddress = address.toLowerCase()
        return get().acceptedTerms[normalizedAddress] || null
      },

      clearTermsData: () => {
        console.log('Clearing all terms data')
        set({ 
          acceptedTerms: {},
          isTermsModalOpen: false
        })
      }
    }),
    {
      name: 'bitredict-terms-storage',
      version: 1,
      // Only persist terms acceptance data, not modal state
      partialize: (state) => ({ 
        acceptedTerms: state.acceptedTerms 
      })
    }
  )
)
