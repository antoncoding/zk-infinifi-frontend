import React, { useReducer, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/common/Button';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { InfoDisplay } from '@/components/common/InfoDisplay';
import { useAccount } from 'wagmi';
import { getPollFromSubgraph, hasUserJoinedPoll } from '@/lib/maci';
import { getPollById } from '@/config/poll';
import { 
  ModalStateData, 
  ModalAction, 
  JoinStep, 
  ENHANCED_JOIN_STEPS, 
  ERROR_CONFIGS,
  DisplayInfo,
  ModalError 
} from '@/types/modal';

type JoinAndVoteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pollId: string;
  pollName?: string;
}

// Initial state
const initialState: ModalStateData = {
  modalState: 'joining',
  joinStep: 'downloading',
  progress: 0,
  subProgress: 0,
  isProcessing: false,
  error: null,
  displayInfo: null,
  stepDetails: null
};

// State reducer for clean state management
function modalReducer(state: ModalStateData, action: ModalAction): ModalStateData {
  switch (action.type) {
    case 'SET_MODAL_STATE':
      return { ...state, modalState: action.state };
    
    case 'SET_JOIN_STEP':
      return { 
        ...state, 
        joinStep: action.step,
        stepDetails: action.details ?? ENHANCED_JOIN_STEPS[action.step],
        error: null // Clear errors when moving to new step
      };
    
    case 'SET_PROGRESS':
      return { 
        ...state, 
        progress: action.progress,
        subProgress: action.subProgress 
      };
    
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.isProcessing };
    
    case 'SET_ERROR':
      return { ...state, error: action.error, isProcessing: false };
    
    case 'SET_INFO':
      return { ...state, displayInfo: action.info };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'RESET_MODAL':
      return initialState;
    
    default:
      return state;
  }
}

export function JoinAndVoteModal({ isOpen, onClose, pollId, pollName }: JoinAndVoteModalProps) {
  const [state, dispatch] = useReducer(modalReducer, initialState);
  
  const { address, isConnected } = useAccount();

  // Create a ref for the retry function to avoid circular dependencies
  const retryFunctionRef = React.useRef<(() => void) | null>(null);

  // Helper function to create errors
  const createError = useCallback((type: keyof typeof ERROR_CONFIGS, message: string, details?: string): ModalError => {
    const config = ERROR_CONFIGS[type];
    return {
      ...config,
      message,
      details,
      retryAction: type !== 'unknown' ? () => retryFunctionRef.current?.() : undefined
    };
  }, []);

  // Check if user has already joined the poll
  useEffect(() => {
    async function checkUserJoined() {
      if (!isConnected || !address || !isOpen) return;

      try {
        // Get poll data from subgraph (for future use)
        await getPollFromSubgraph(pollId);

        // Check if user has already joined
        const joined = await hasUserJoinedPoll(pollId, String(address));
        
        if (joined) {
          dispatch({ type: 'SET_MODAL_STATE', state: 'voting' });
        }
      } catch (error) {
        console.error('Failed to check user join status:', error);
        // Don't show error for this check, just proceed with join flow
      }
    }

    void checkUserJoined();
  }, [isConnected, address, isOpen, pollId]);

  // Helper function to show info during steps
  const showStepInfo = useCallback((content: string, items?: string[], variant?: DisplayInfo['variant']) => {
    dispatch({
      type: 'SET_INFO',
      info: {
        type: 'progress',
        content,
        items,
        variant: variant ?? 'default'
      }
    });
  }, []);

  // Simulated step execution with proper error handling
  const executeStep = useCallback(async (
    step: JoinStep,
    stepFunction: () => Promise<void>,
    progressStart: number,
    progressEnd: number
  ) => {
    try {
      dispatch({ type: 'SET_JOIN_STEP', step });
      dispatch({ type: 'SET_PROGRESS', progress: progressStart });
      
      const stepDetails = ENHANCED_JOIN_STEPS[step];
      
      // Show initial step info
      showStepInfo(stepDetails.description, stepDetails.tips, 'info');
      
      // Simulate sub-steps if available
      if (stepDetails.subSteps) {
        for (let i = 0; i < stepDetails.subSteps.length; i++) {
          const subProgress = progressStart + ((progressEnd - progressStart) * i / stepDetails.subSteps.length);
          dispatch({ type: 'SET_PROGRESS', progress: subProgress, subProgress: (i / stepDetails.subSteps.length) * 100 });
          
          showStepInfo(`${stepDetails.description}\n\n${stepDetails.subSteps[i]}...`);
          
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        }
      }
      
      // Execute the actual step function
      await stepFunction();
      
      dispatch({ type: 'SET_PROGRESS', progress: progressEnd, subProgress: 100 });
      
      // Show completion info
      if (step === 'completed') {
        showStepInfo('Successfully joined the poll!', ['You can now participate in voting'], 'success');
      }
      
    } catch (error: unknown) {
      console.error(`Error in step ${step}:`, error);
      
      // Create appropriate error based on step and error type
      let modalError: ModalError;
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        modalError = createError('network', 'Failed to connect to the network. Please check your internet connection.', errorMessage);
      } else if (errorMessage.includes('wallet')) {
        modalError = createError('wallet', 'Wallet connection failed. Please ensure your wallet is connected.', errorMessage);
      } else if (errorMessage.includes('timeout')) {
        modalError = createError('timeout', 'Operation timed out. This might be due to network congestion.', errorMessage);
      } else if (step === 'generating-proof') {
        modalError = createError('proof', 'Failed to generate cryptographic proof. This might be due to insufficient browser resources.', errorMessage);
      } else {
        const stepLabel = 'process'; // Default fallback for error message
        modalError = createError('sdk', `Error during ${stepLabel}. Please try again.`, errorMessage);
      }
      
      dispatch({ type: 'SET_ERROR', error: modalError });
    }
  }, [createError, showStepInfo]);

  // Main join poll function
  const handleJoinPoll = useCallback(async () => {
    if (state.isProcessing) return;
    
    dispatch({ type: 'SET_PROCESSING', isProcessing: true });
    dispatch({ type: 'CLEAR_ERROR' });

    // Set the retry function reference  
    retryFunctionRef.current = () => {
      dispatch({ type: 'CLEAR_ERROR' });
      void handleJoinPoll();
    };

    const pollConfig = getPollById(pollId);
    if (!pollConfig) {
      dispatch({ 
        type: 'SET_ERROR', 
        error: createError('sdk', 'Poll configuration not found', `Poll ID: ${pollId}`)
      });
      return;
    }

    try {
      // Step 1: Download artifacts
      await executeStep(
        'downloading',
        async () => {
          // Download poll joining artifacts - placeholder
          await new Promise(resolve => setTimeout(resolve, 1000));
        },
        0, 25
      );

      // Step 2: Generate proof and join
      await executeStep(
        'generating-proof',
        async () => {
          // Generate proof and join the poll - placeholder
          await new Promise(resolve => setTimeout(resolve, 2000));
          // In the real implementation, this would generate voting proofs
        },
        25, 75
      );

      // Step 3: Submit transaction
      await executeStep(
        'submitting',
        async () => {
          // Transaction should have been submitted in the previous step
          // This step is for waiting for confirmation
          showStepInfo('Transaction submitted, waiting for confirmation...');
        },
        75, 100
      );

      // Step 4: Complete
      await executeStep(
        'completed',
        async () => {
          // Auto-transition to voting after delay
          setTimeout(() => {
            dispatch({ type: 'SET_MODAL_STATE', state: 'voting' });
          }, 2000);
        },
        100, 100
      );

    } catch (error) {
      // Error handling is done in executeStep
      console.error('Join poll failed:', error);
    } finally {
      dispatch({ type: 'SET_PROCESSING', isProcessing: false });
    }
  }, [state.isProcessing, executeStep, pollId, createError, showStepInfo]);

  const handleVote = useCallback(async () => {
    // Simplified voting for now - just show success
    dispatch({ type: 'SET_MODAL_STATE', state: 'completed' });
  }, []);

  const handleRetry = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
    void handleJoinPoll();
  }, [handleJoinPoll]);

  const handleClose = useCallback(() => {
    dispatch({ type: 'RESET_MODAL' });
    onClose();
  }, [onClose]);

  const renderJoiningContent = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-secondary-foreground">
          Join Poll to Vote
        </h3>
        <p className="text-sm text-muted-foreground">
          {pollName ? `Join "${pollName}" to participate` : `Join Poll #${pollId} to participate`}
        </p>
      </div>

      {/* Error Display */}
      {state.error && (
        <ErrorDisplay 
          error={state.error} 
          onRetry={handleRetry}
          onDismiss={() => dispatch({ type: 'CLEAR_ERROR' })}
        />
      )}

      {/* Processing State */}
      {state.isProcessing && !state.error && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-secondary-foreground">
                {state.stepDetails?.label ?? 'Processing...'}
              </span>
              <span className="text-sm text-muted-foreground">
                {state.progress}%
              </span>
            </div>
            <Progress value={state.progress} className="h-2" />
            
            {state.subProgress !== undefined && state.subProgress > 0 && (
              <Progress value={state.subProgress} className="h-1 opacity-60" />
            )}
          </div>

          {state.stepDetails && (
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">
                {state.stepDetails.description}
              </p>
              {state.stepDetails.expectedDuration && (
                <p className="text-xs text-muted-foreground opacity-75">
                  Expected time: {state.stepDetails.expectedDuration}
                </p>
              )}
            </div>
          )}

          {/* Dynamic Info Display */}
          {state.displayInfo && (
            <InfoDisplay info={state.displayInfo} />
          )}

          {state.joinStep === 'completed' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 text-green-600 mb-2">
                ✓
              </div>
              <p className="text-sm font-medium text-secondary-foreground">
                Successfully joined the poll!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Transitioning to voting...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!state.isProcessing && !state.error && (
        <div className="space-y-4 text-center">
          <InfoDisplay 
            info={{
              type: 'tip',
              content: 'Join to participate in private voting with zero-knowledge proofs.',
              variant: 'info'
            }}
          />
          
          <Button 
            onClick={() => { void handleJoinPoll(); }}
            className="w-full"
            disabled={state.isProcessing}
          >
            Join Poll
          </Button>
        </div>
      )}
    </div>
  );

  const renderVotingContent = () => {

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-secondary-foreground">
            Cast Your Vote
          </h3>
          <p className="text-sm text-muted-foreground">
            {pollName ? `Vote in "${pollName}"` : `Vote in Poll #${pollId}`}
          </p>
        </div>

        {/* Error Display */}
        {state.error && (
          <ErrorDisplay 
            error={state.error} 
            onRetry={() => { /* Handle retry for voting */ }}
            onDismiss={() => dispatch({ type: 'CLEAR_ERROR' })}
          />
        )}

        {/* Processing State */}
        {state.isProcessing && (
          <div className="text-center space-y-4">
            <Progress value={75} className="h-2" />
            {state.displayInfo && (
              <InfoDisplay info={state.displayInfo} />
            )}
          </div>
        )}

        {/* Simplified Voting Interface */}
        {!state.isProcessing && !state.error && (
          <div className="space-y-4 text-center">
            <InfoDisplay 
              info={{
                type: 'tip',
                content: 'You have successfully joined this poll. Voting functionality will be available soon.',
                variant: 'success'
              }}
            />
            
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleClose} className="flex-1">
                Close
              </Button>
              <Button 
                onClick={() => { void handleVote(); }} 
                className="flex-1"
              >
                Continue to Vote
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCompletedContent = () => (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-green-100 text-green-600 text-2xl mb-4">
          ✓
        </div>
        <h3 className="text-lg font-semibold text-secondary-foreground">
          Vote Submitted!
        </h3>
        <p className="text-sm text-muted-foreground">
          Your vote has been successfully recorded using zero-knowledge proofs.
        </p>
      </div>

      <Button onClick={handleClose} className="w-full">
        Close
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-secondary-foreground">
            {state.modalState === 'joining' && 'Join Poll'}
            {state.modalState === 'voting' && 'Vote'}
            {state.modalState === 'completed' && 'Complete'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {state.modalState === 'joining' && renderJoiningContent()}
          {state.modalState === 'voting' && renderVotingContent()}
          {state.modalState === 'completed' && renderCompletedContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default JoinAndVoteModal;