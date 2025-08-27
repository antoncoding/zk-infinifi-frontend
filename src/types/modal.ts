// Modal state management types for JoinAndVoteModal

export type ModalState = 'joining' | 'voting' | 'completed';
export type JoinStep = 'downloading' | 'generating-proof' | 'submitting' | 'completed';

// Error handling types
export type ErrorType = 'network' | 'proof' | 'wallet' | 'timeout' | 'sdk' | 'unknown';

export type ModalError = {
  type: ErrorType;
  title: string;
  message: string;
  details?: string;
  recoverable: boolean;
  retryAction?: () => void;
}

// Dynamic info display types
export type InfoType = 'progress' | 'tip' | 'technical' | 'warning';

export type DisplayInfo = {
  type: InfoType;
  title?: string;
  content: string;
  items?: string[];
  variant?: 'default' | 'warning' | 'info' | 'success';
}

// Enhanced step information
export type StepDetails = {
  label: string;
  description: string;
  technicalDetails?: string;
  tips?: string[];
  expectedDuration?: string;
  subSteps?: string[];
}

// Modal state interface
export type ModalStateData = {
  modalState: ModalState;
  joinStep: JoinStep;
  progress: number;
  subProgress?: number;
  isProcessing: boolean;
  error: ModalError | null;
  displayInfo: DisplayInfo | null;
  stepDetails: StepDetails | null;
}

// Action creators for state updates
export type ModalAction =
  | { type: 'SET_MODAL_STATE'; state: ModalState }
  | { type: 'SET_JOIN_STEP'; step: JoinStep; details?: StepDetails }
  | { type: 'SET_PROGRESS'; progress: number; subProgress?: number }
  | { type: 'SET_PROCESSING'; isProcessing: boolean }
  | { type: 'SET_ERROR'; error: ModalError | null }
  | { type: 'SET_INFO'; info: DisplayInfo | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_MODAL' };

// Enhanced step configurations
export const ENHANCED_JOIN_STEPS: Record<JoinStep, StepDetails> = {
  downloading: {
    label: 'Downloading Artifacts',
    description: 'Downloading zk-SNARK artifacts...',
    technicalDetails: 'Fetching proving and verifying keys for poll joining circuit',
    expectedDuration: '10-30 seconds',
    tips: [
      'These files are cached for future use',
      'Download time depends on your internet connection'
    ],
    subSteps: [
      'Downloading proving key (zKey)',
      'Downloading WebAssembly circuit',
      'Verifying artifact integrity'
    ]
  },
  'generating-proof': {
    label: 'Generating Proof',
    description: 'Generating zk-SNARK proof of eligibility...',
    technicalDetails: 'Creating cryptographic proof that you know the private key without revealing it',
    expectedDuration: '30-90 seconds',
    tips: [
      'This proves you\'re eligible to join without revealing your identity',
      'The proof is generated locally in your browser',
      'Proof generation is computationally intensive'
    ],
    subSteps: [
      'Fetching MACI state tree',
      'Generating inclusion proof',
      'Computing zk-SNARK witness',
      'Generating final proof'
    ]
  },
  submitting: {
    label: 'Joining Poll',
    description: 'Submitting transaction to join poll...',
    technicalDetails: 'Broadcasting join transaction with your zk-proof to the blockchain',
    expectedDuration: '10-60 seconds',
    tips: [
      'Transaction time depends on network congestion',
      'Your wallet will show the transaction confirmation'
    ],
    subSteps: [
      'Preparing transaction data',
      'Waiting for wallet confirmation',
      'Broadcasting to network',
      'Waiting for confirmation'
    ]
  },
  completed: {
    label: 'Joined Successfully',
    description: 'Ready to vote!',
    technicalDetails: 'You are now registered for this poll and can submit votes',
    tips: [
      'Your join status is now recorded on-chain',
      'You can now participate in the voting process'
    ]
  }
};

// Common error configurations
export const ERROR_CONFIGS: Record<ErrorType, Omit<ModalError, 'message' | 'details' | 'retryAction'>> = {
  network: {
    type: 'network',
    title: 'Network Error',
    recoverable: true
  },
  proof: {
    type: 'proof',
    title: 'Proof Generation Failed',
    recoverable: true
  },
  wallet: {
    type: 'wallet',
    title: 'Wallet Error',
    recoverable: true
  },
  timeout: {
    type: 'timeout',
    title: 'Operation Timed Out',
    recoverable: true
  },
  sdk: {
    type: 'sdk',
    title: 'SDK Error',
    recoverable: true
  },
  unknown: {
    type: 'unknown',
    title: 'Unknown Error',
    recoverable: false
  }
};