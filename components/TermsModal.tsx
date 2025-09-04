"use client";

import { useState, useEffect } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { FiX, FiCheck, FiAlertTriangle, FiExternalLink, FiShield, FiInfo } from 'react-icons/fi'
import Button from '@/components/button'
import LoadingSpinner from '@/components/LoadingSpinner'

interface TermsSection {
  id: string
  title: string
  content: string
}

interface TermsData {
  version: string
  lastUpdated: string
  title: string
  sections: TermsSection[]
  summary: {
    title: string
    points: string[]
  }
}

interface TermsModalProps {
  isOpen: boolean
  onAccept: () => void
  onDecline: () => void
}

export default function TermsModal({ isOpen, onAccept, onDecline }: TermsModalProps) {
  const { address } = useAccount()
  const { signMessage, isPending: isSigningPending } = useSignMessage()
  
  const [termsData, setTermsData] = useState<TermsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFullTerms, setShowFullTerms] = useState(false)
  const [hasReadSummary, setHasReadSummary] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [acceptanceStep, setAcceptanceStep] = useState<'reading' | 'confirming' | 'signing' | 'submitting'>('reading')

  // Fetch terms data
  useEffect(() => {
    if (isOpen) {
      fetchTerms()
    }
  }, [isOpen])

  const fetchTerms = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/terms/current')
      if (!response.ok) {
        throw new Error('Failed to fetch terms')
      }
      
      const data = await response.json()
      setTermsData(data.terms)
    } catch (err) {
      console.error('Error fetching terms:', err)
      setError('Failed to load terms and conditions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!address || !termsData) return

    try {
      setIsAccepting(true)
      setAcceptanceStep('signing')

      // Step 1: Sign authentication message
      const authMessage = `Authenticate wallet for Bitredict Terms Acceptance\nAddress: ${address}\nVersion: ${termsData.version}\nTimestamp: ${Date.now()}`
      
      const authSignature = await signMessage({ message: authMessage })
      
      // Step 2: Authenticate wallet
      setAcceptanceStep('submitting')
      const authResponse = await fetch('/api/faucet/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          signature: authSignature,
          message: authMessage
        })
      })

      if (!authResponse.ok) {
        const authError = await authResponse.json()
        throw new Error(authError.error || 'Authentication failed')
      }

      // Step 3: Accept terms
      const termsResponse = await fetch('/api/faucet/accept-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          termsVersion: termsData.version
        })
      })

      if (!termsResponse.ok) {
        const termsError = await termsResponse.json()
        throw new Error(termsError.error || 'Failed to accept terms')
      }

      // Success - call parent callback
      onAccept()
      
    } catch (err) {
      console.error('Error accepting terms:', err)
      setError(err instanceof Error ? err.message : 'Failed to accept terms')
      setAcceptanceStep('reading')
    } finally {
      setIsAccepting(false)
    }
  }

  const handleDecline = () => {
    onDecline()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <FiShield className="text-blue-400 text-xl" />
            <div>
              <h2 className="text-xl font-bold text-white">Terms of Service</h2>
              <p className="text-sm text-gray-400">
                {termsData ? `Version ${termsData.version} • Updated ${termsData.lastUpdated}` : 'Loading...'}
              </p>
            </div>
          </div>
          <button
            onClick={handleDecline}
            className="text-gray-400 hover:text-white transition-colors p-2"
            disabled={isAccepting}
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="ml-3 text-gray-400">Loading terms...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FiAlertTriangle className="text-red-400 text-3xl mx-auto mb-3" />
                <p className="text-red-400 mb-4">{error}</p>
                <Button onClick={fetchTerms} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            </div>
          ) : termsData ? (
            <div className="space-y-6">
              {/* Important Notice */}
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FiInfo className="text-blue-400 text-lg mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-300 mb-2">Important Notice</h3>
                    <p className="text-sm text-blue-200">
                      By using Bitredict, you agree to these terms. Please read them carefully before proceeding.
                      This platform operates on Monad Testnet - all tokens are for testing purposes only.
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms Summary */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <FiCheck className="text-green-400" />
                  {termsData.summary.title}
                </h3>
                <ul className="space-y-2">
                  {termsData.summary.points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-green-400 mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Full Terms Toggle */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setShowFullTerms(!showFullTerms)
                    setHasReadSummary(true)
                  }}
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 mx-auto"
                >
                  <FiExternalLink />
                  {showFullTerms ? 'Hide Full Terms' : 'Read Full Terms & Conditions'}
                </button>
              </div>

              {/* Full Terms Content */}
              {showFullTerms && (
                <div className="bg-gray-800 rounded-lg p-6 space-y-6 max-h-96 overflow-y-auto">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                    {termsData.title}
                  </h3>
                  {termsData.sections.map((section) => (
                    <div key={section.id} className="space-y-2">
                      <h4 className="font-semibold text-blue-300">{section.title}</h4>
                      <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                        {section.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Acceptance Status */}
              {acceptanceStep !== 'reading' && (
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <LoadingSpinner size="sm" />
                    <div>
                      <p className="text-yellow-300 font-medium">
                        {acceptanceStep === 'signing' && 'Please sign the authentication message...'}
                        {acceptanceStep === 'submitting' && 'Submitting terms acceptance...'}
                        {acceptanceStep === 'confirming' && 'Confirming acceptance...'}
                      </p>
                      <p className="text-sm text-yellow-200">
                        This will authenticate your wallet and record your acceptance.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        {termsData && !isLoading && (
          <div className="border-t border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {hasReadSummary ? (
                  <span className="text-green-400 flex items-center gap-1">
                    <FiCheck /> Summary reviewed
                  </span>
                ) : (
                  'Please review the terms summary above'
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleDecline}
                  variant="outline"
                  disabled={isAccepting}
                >
                  Decline
                </Button>
                <Button
                  onClick={handleAccept}
                  disabled={!hasReadSummary || isAccepting}
                  loading={isAccepting}
                >
                  {isAccepting ? 'Accepting...' : 'Accept & Continue'}
                </Button>
              </div>
            </div>
            
            {!hasReadSummary && (
              <p className="text-xs text-gray-500 mt-2">
                Please review the terms summary to enable the Accept button
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
