import { useAccount, useWalletClient, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { parseEther, parseUnits, type Address } from 'viem';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import { CONTRACTS } from '@/contracts';
import { GuidedMarketService } from './guidedMarketService';

/**
 * Enhanced Guided Market Service with Wallet Integration
 * 
 * This service handles the complete flow for creating guided markets:
 * 1. Prepare transaction data via backend
 * 2. Execute transaction via MetaMask/wallet
 * 3. Confirm transaction via backend for indexing
 */

export interface GuidedMarketTransactionData {
  contractAddress: string;
  functionName: string;
  parameters: any[];
  value: string;
  gasEstimate: string;
  totalRequiredWei?: string; // Total amount needed for approval/transfer (includes fee)
  creationFeeWei?: string;   // Fee amount
  marketDetails: any;
}

export interface TransactionStatusCallback {
  (type: 'info' | 'pending' | 'confirming' | 'success' | 'error', title: string, message: string, hash?: string): void;
}

export interface CreateFootballMarketParams {
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  matchDate: string;
  outcome: string;
  predictedOutcome: string;
  odds: number;
  creatorStake: number;
  useBitr?: boolean;
  description?: string;
  isPrivate?: boolean;
  maxBetPerUser?: number;
}

export interface CreateCryptoMarketParams {
  cryptocurrency: {
    symbol: string;
    name: string;
  };
  targetPrice: number;
  direction: 'above' | 'below';
  timeframe: string;
  predictedOutcome: string;
  odds: number;
  creatorStake: number;
  useBitr?: boolean;
  description?: string;
  isPrivate?: boolean;
  maxBetPerUser?: number;
}

export class GuidedMarketWalletService {
  /**
   * Create a football market using the new prepare/confirm flow
   */
  static async createFootballMarketWithWallet(
    marketData: CreateFootballMarketParams,
    walletClient: any,
    publicClient: any,
    address: Address,
    statusCallback?: TransactionStatusCallback
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    marketId?: string;
    error?: string;
  }> {
    try {
      console.log('🚀 Starting guided football market creation...');
      console.log('📋 Market data:', marketData);
      
      // Step 1: Prepare transaction data via backend
      console.log('📡 Step 1: Preparing transaction data...');
      statusCallback?.('info', 'Preparing Transaction', 'Preparing market creation transaction...');
      
      const prepareResult = await GuidedMarketService.prepareFootballMarket(marketData);
      
      if (!prepareResult.success) {
        statusCallback?.('error', 'Preparation Failed', `Failed to prepare transaction: ${prepareResult.error}`);
        return {
          success: false,
          error: `Failed to prepare transaction: ${prepareResult.error}`
        };
      }
      
      const transactionData = prepareResult.data as GuidedMarketTransactionData;
      console.log('✅ Transaction data prepared:', {
        contractAddress: transactionData.contractAddress,
        functionName: transactionData.functionName,
        marketId: transactionData.marketDetails.marketId
      });
      
      // Step 2: Handle BITR approval if needed
      if (marketData.useBitr) {
        console.log('🪙 Step 2: Handling BITR token approval...');
        statusCallback?.('pending', 'BITR Approval', 'Requesting BITR token approval...');
        
        // Use totalRequiredWei which includes the 50 BITR creation fee
        const totalRequiredWei = transactionData.totalRequiredWei || transactionData.parameters[2];
        
        const approvalResult = await this.handleBitrApproval(
          totalRequiredWei, // totalRequiredWei (creatorStake + 50 BITR fee)
          walletClient,
          publicClient,
          address,
          statusCallback
        );
        
        if (!approvalResult.success) {
          statusCallback?.('error', 'Approval Failed', `BITR approval failed: ${approvalResult.error}`);
          return {
            success: false,
            error: `BITR approval failed: ${approvalResult.error}`
          };
        }
        
        console.log('✅ BITR approval completed');
        statusCallback?.('info', 'Approval Complete', 'BITR token approval successful');
      }
      
      // Step 3: Execute the main transaction via wallet
      console.log('💳 Step 3: Executing transaction via wallet...');
      statusCallback?.('confirming', 'Creating Market', 'Executing market creation transaction...');
      
      const txResult = await this.executeTransaction(
        transactionData,
        walletClient,
        publicClient,
        address,
        statusCallback
      );
      
      if (!txResult.success) {
        statusCallback?.('error', 'Transaction Failed', `Transaction execution failed: ${txResult.error}`);
        return {
          success: false,
          error: `Transaction execution failed: ${txResult.error}`
        };
      }
      
      console.log('✅ Transaction executed:', txResult.hash);
      statusCallback?.('confirming', 'Transaction Confirmed', 'Transaction confirmed on blockchain', txResult.hash);
      
      // Step 4: Confirm transaction via backend for indexing
      console.log('📡 Step 4: Confirming transaction with backend...');
      statusCallback?.('info', 'Finalizing Market', 'Confirming market creation with backend...');
      
      const confirmResult = await GuidedMarketService.confirmFootballMarket(
        txResult.hash!,
        transactionData.marketDetails
      );
      
      if (!confirmResult.success) {
        console.warn('⚠️ Backend confirmation failed, but transaction was successful:', confirmResult.error);
        statusCallback?.('error', 'Backend Warning', 'Transaction successful but backend confirmation failed');
        // Don't fail the entire process if backend confirmation fails
      } else {
        console.log('✅ Backend confirmation completed');
        statusCallback?.('success', 'Market Created!', 'Your football prediction market has been created successfully!', txResult.hash);
      }
      
      return {
        success: true,
        transactionHash: txResult.hash,
        marketId: transactionData.marketDetails.marketId
      };
      
    } catch (error) {
      console.error('❌ Error creating football market:', error);
      statusCallback?.('error', 'Creation Failed', error instanceof Error ? error.message : 'Unknown error occurred');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create a cryptocurrency market using the new prepare/confirm flow
   */
  static async createCryptoMarketWithWallet(
    marketData: CreateCryptoMarketParams,
    walletClient: any,
    publicClient: any,
    address: Address,
    statusCallback?: TransactionStatusCallback
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    marketId?: string;
    error?: string;
  }> {
    try {
      console.log('🚀 Starting guided cryptocurrency market creation...');
      console.log('📋 Market data:', marketData);
      
      // Step 1: Prepare transaction data via backend
      console.log('📡 Step 1: Preparing transaction data...');
      statusCallback?.('info', 'Preparing Transaction', 'Preparing cryptocurrency market creation transaction...');
      
      const prepareResult = await GuidedMarketService.prepareCryptoMarket(marketData);
      
      if (!prepareResult.success) {
        statusCallback?.('error', 'Preparation Failed', `Failed to prepare transaction: ${prepareResult.error}`);
        return {
          success: false,
          error: `Failed to prepare transaction: ${prepareResult.error}`
        };
      }
      
      const transactionData = prepareResult.data as GuidedMarketTransactionData;
      console.log('✅ Transaction data prepared:', {
        contractAddress: transactionData.contractAddress,
        functionName: transactionData.functionName,
        marketId: transactionData.marketDetails.marketId
      });
      
      // Step 2: Handle BITR approval if needed
      if (marketData.useBitr) {
        console.log('🪙 Step 2: Handling BITR token approval...');
        statusCallback?.('pending', 'BITR Approval', 'Requesting BITR token approval...');
        
        // Use totalRequiredWei which includes the 50 BITR creation fee
        const totalRequiredWei = transactionData.totalRequiredWei || transactionData.parameters[2];
        
        const approvalResult = await this.handleBitrApproval(
          totalRequiredWei, // totalRequiredWei (creatorStake + 50 BITR fee)
          walletClient,
          publicClient,
          address,
          statusCallback
        );
        
        if (!approvalResult.success) {
          statusCallback?.('error', 'Approval Failed', `BITR approval failed: ${approvalResult.error}`);
          return {
            success: false,
            error: `BITR approval failed: ${approvalResult.error}`
          };
        }
        
        console.log('✅ BITR approval completed');
        statusCallback?.('info', 'Approval Complete', 'BITR token approval successful');
      }
      
      // Step 3: Execute the main transaction via wallet
      console.log('💳 Step 3: Executing transaction via wallet...');
      statusCallback?.('confirming', 'Creating Market', 'Executing cryptocurrency market creation transaction...');
      
      const txResult = await this.executeTransaction(
        transactionData,
        walletClient,
        publicClient,
        address,
        statusCallback
      );
      
      if (!txResult.success) {
        statusCallback?.('error', 'Transaction Failed', `Transaction execution failed: ${txResult.error}`);
        return {
          success: false,
          error: `Transaction execution failed: ${txResult.error}`
        };
      }
      
      console.log('✅ Transaction executed:', txResult.hash);
      statusCallback?.('confirming', 'Transaction Confirmed', 'Transaction confirmed on blockchain', txResult.hash);
      
      // Step 4: Confirm transaction via backend for indexing
      console.log('📡 Step 4: Confirming transaction with backend...');
      statusCallback?.('info', 'Finalizing Market', 'Confirming market creation with backend...');
      
      const confirmResult = await GuidedMarketService.confirmCryptoMarket(
        txResult.hash!,
        transactionData.marketDetails
      );
      
      if (!confirmResult.success) {
        console.warn('⚠️ Backend confirmation failed, but transaction was successful:', confirmResult.error);
        statusCallback?.('error', 'Backend Warning', 'Transaction successful but backend confirmation failed');
        // Don't fail the entire process if backend confirmation fails
      } else {
        console.log('✅ Backend confirmation completed');
        statusCallback?.('success', 'Market Created!', 'Your cryptocurrency prediction market has been created successfully!', txResult.hash);
      }
      
      return {
        success: true,
        transactionHash: txResult.hash,
        marketId: transactionData.marketDetails.marketId
      };
      
    } catch (error) {
      console.error('❌ Error creating cryptocurrency market:', error);
      statusCallback?.('error', 'Creation Failed', error instanceof Error ? error.message : 'Unknown error occurred');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Handle BITR token approval for guided markets
   */
  private static async handleBitrApproval(
    stakeAmount: string,
    walletClient: any,
    publicClient: any,
    address: Address,
    statusCallback?: TransactionStatusCallback
  ): Promise<{ success: boolean; error?: string; hash?: string }> {
    try {
      console.log('🔍 Checking BITR allowance...');
      
      // Check current allowance using publicClient (correct wagmi v2 API)
      const currentAllowance = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.BITR_TOKEN,
        abi: CONTRACTS.BITR_TOKEN.abi,
        functionName: 'allowance',
        args: [address, CONTRACT_ADDRESSES.BITR_POOL]
      });
      
      const requiredAmount = BigInt(stakeAmount);
      
      if (currentAllowance >= requiredAmount) {
        console.log('✅ Sufficient BITR allowance already exists');
        return { success: true };
      }
      
      console.log('📝 Requesting BITR approval...');
      console.log(`   Required: ${requiredAmount.toString()}`);
      console.log(`   Current: ${currentAllowance.toString()}`);
      
      statusCallback?.('pending', 'Approval Transaction', 'Please confirm the BITR approval transaction in your wallet...');
      
      // Request approval using walletClient (correct wagmi v2 API)
      const approvalHash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.BITR_TOKEN,
        abi: CONTRACTS.BITR_TOKEN.abi,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.BITR_POOL, requiredAmount],
        account: address
      });
      
      console.log('⏳ Waiting for approval confirmation...');
      statusCallback?.('confirming', 'Approval Confirming', 'Waiting for BITR approval confirmation...', approvalHash);
      
      // Wait for approval transaction using publicClient
      const approvalReceipt = await publicClient.waitForTransactionReceipt({
        hash: approvalHash
      });
      
      if (approvalReceipt.status !== 'success') {
        throw new Error('BITR approval transaction failed');
      }
      
      console.log('✅ BITR approval confirmed:', approvalHash);
      return { success: true, hash: approvalHash };
      
    } catch (error) {
      console.error('❌ BITR approval error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('user rejected')) {
          return { success: false, error: 'User rejected BITR approval' };
        } else if (error.message.includes('insufficient funds')) {
          return { success: false, error: 'Insufficient BITR balance for approval' };
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'BITR approval failed'
      };
    }
  }
  
  /**
   * Execute the main transaction via wallet
   */
  private static async executeTransaction(
    transactionData: GuidedMarketTransactionData,
    walletClient: any,
    publicClient: any,
    address: Address,
    statusCallback?: TransactionStatusCallback
  ): Promise<{ success: boolean; hash?: string; error?: string }> {
    try {
      console.log('🎯 Executing main transaction...');
      console.log('📋 Transaction details:', {
        contract: transactionData.contractAddress,
        function: transactionData.functionName,
        value: transactionData.value,
        gasEstimate: transactionData.gasEstimate
      });
      
      statusCallback?.('pending', 'Transaction Pending', 'Please confirm the market creation transaction in your wallet...');
      
      // Execute the transaction
      const hash = await walletClient.writeContract({
        address: transactionData.contractAddress as Address,
        abi: CONTRACTS.BITREDICT_POOL.abi,
        functionName: transactionData.functionName,
        args: transactionData.parameters,
        value: transactionData.value === '0' ? BigInt(0) : parseEther(transactionData.value),
        account: address,
        gas: BigInt(transactionData.gasEstimate)
      });
      
      console.log('⏳ Waiting for transaction confirmation...');
      statusCallback?.('confirming', 'Transaction Confirming', 'Waiting for transaction confirmation on blockchain...', hash);
      
      // Wait for transaction confirmation using publicClient (correct wagmi v2 API)
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      if (receipt.status !== 'success') {
        throw new Error(`Transaction failed with status: ${receipt.status}`);
      }
      
      console.log('✅ Transaction confirmed:', hash);
      return { success: true, hash };
      
    } catch (error) {
      console.error('❌ Transaction execution error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('user rejected')) {
          return { success: false, error: 'User rejected transaction' };
        } else if (error.message.includes('insufficient funds')) {
          return { success: false, error: 'Insufficient funds for transaction' };
        } else if (error.message.includes('gas')) {
          return { success: false, error: 'Gas estimation failed. Please try again.' };
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction execution failed'
      };
    }
  }
}

/**
 * React hook for guided market creation with wallet integration
 */
export function useGuidedMarketCreation() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  const createFootballMarket = async (marketData: CreateFootballMarketParams, statusCallback?: TransactionStatusCallback) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }
    
    if (!walletClient) {
      throw new Error('Wallet client not available');
    }
    
    if (!publicClient) {
      throw new Error('Public client not available');
    }
    
    return await GuidedMarketWalletService.createFootballMarketWithWallet(
      marketData,
      walletClient,
      publicClient,
      address,
      statusCallback
    );
  };

  const createCryptoMarket = async (marketData: CreateCryptoMarketParams, statusCallback?: TransactionStatusCallback) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }
    
    if (!walletClient) {
      throw new Error('Wallet client not available');
    }
    
    if (!publicClient) {
      throw new Error('Public client not available');
    }
    
    return await GuidedMarketWalletService.createCryptoMarketWithWallet(
      marketData,
      walletClient,
      publicClient,
      address,
      statusCallback
    );
  };
  
  return {
    createFootballMarket,
    createCryptoMarket,
    isConnected,
    address,
    walletClient: !!walletClient,
    publicClient: !!publicClient
  };
}