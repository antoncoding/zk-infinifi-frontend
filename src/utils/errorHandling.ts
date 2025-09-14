import toast from 'react-hot-toast';

type ErrorCode = {
  code: string;
  message: string;
  userMessage: string;
};

const COMMON_ERROR_CODES: Record<string, ErrorCode> = {
  // Wallet/Connection Errors
  '4001': {
    code: '4001',
    message: 'User rejected the request',
    userMessage: 'Transaction was cancelled by user'
  },
  '4100': {
    code: '4100',
    message: 'Unauthorized method',
    userMessage: 'Wallet connection required'
  },
  '4200': {
    code: '4200',
    message: 'Unsupported method',
    userMessage: 'This action is not supported by your wallet'
  },
  '4900': {
    code: '4900',
    message: 'Disconnected',
    userMessage: 'Wallet is disconnected. Please connect your wallet'
  },
  '4901': {
    code: '4901',
    message: 'Chain disconnected',
    userMessage: 'Wrong network. Please switch to Base Sepolia'
  },
  
  // Contract/Transaction Errors
  'INSUFFICIENT_FUNDS': {
    code: 'INSUFFICIENT_FUNDS',
    message: 'Insufficient funds for gas',
    userMessage: 'Insufficient funds for transaction fees'
  },
  'UNPREDICTABLE_GAS_LIMIT': {
    code: 'UNPREDICTABLE_GAS_LIMIT',
    message: 'Cannot estimate gas',
    userMessage: 'Transaction may fail. Check your inputs and try again'
  },
  'NETWORK_ERROR': {
    code: 'NETWORK_ERROR',
    message: 'Network error',
    userMessage: 'Network connection issue. Please try again'
  },
  'TIMEOUT': {
    code: 'TIMEOUT',
    message: 'Transaction timeout',
    userMessage: 'Transaction timed out. Please try again'
  },
  
  // Semaphore/Voting Specific Errors
  'INVALID_PROOF': {
    code: 'INVALID_PROOF',
    message: 'Invalid proof',
    userMessage: 'Unable to generate valid proof. Please try again'
  },
  'DUPLICATE_NULLIFIER': {
    code: 'DUPLICATE_NULLIFIER',
    message: 'Duplicate nullifier',
    userMessage: 'You have already voted in this epoch'
  },
  'NOT_GROUP_MEMBER': {
    code: 'NOT_GROUP_MEMBER',
    message: 'Not a group member',
    userMessage: 'You are not a member of the required group'
  },
  'INVALID_GROUP': {
    code: 'INVALID_GROUP',
    message: 'Invalid group',
    userMessage: 'Invalid voting group. Please try joining a group first'
  },
  'VOTING_CLOSED': {
    code: 'VOTING_CLOSED',
    message: 'Voting period closed',
    userMessage: 'Voting period has ended for this epoch'
  },
  'INVALID_ALLOCATION': {
    code: 'INVALID_ALLOCATION',
    message: 'Invalid allocation',
    userMessage: 'Invalid vote allocation. Please check your percentages'
  },
  
  // API/Server Errors
  'RATE_LIMIT': {
    code: 'RATE_LIMIT',
    message: 'Rate limit exceeded',
    userMessage: 'Too many requests. Please wait and try again'
  },
  'SERVER_ERROR': {
    code: 'SERVER_ERROR',
    message: 'Server error',
    userMessage: 'Server error. Please try again later'
  },
  'INVALID_REQUEST': {
    code: 'INVALID_REQUEST',
    message: 'Invalid request',
    userMessage: 'Invalid request. Please refresh and try again'
  }
};

type ParsedError = {
  code: string;
  originalMessage: string;
  userMessage: string;
  severity: 'error' | 'warning' | 'info';
};

export function parseError(error: unknown): ParsedError {
  let errorMessage = 'An unknown error occurred';
  let errorCode = 'UNKNOWN_ERROR';
  const severity: 'error' | 'warning' | 'info' = 'error';

  // Handle different error types
  if (error instanceof Error) {
    errorMessage = error.message;
    
    // Extract error codes from different sources
    const errorString = error.toString().toLowerCase();
    
    // Check for wallet error codes in the message
    for (const [code, errorData] of Object.entries(COMMON_ERROR_CODES)) {
      if (errorMessage.includes(code.toLowerCase()) || 
          errorString.includes(errorData.message.toLowerCase()) ||
          errorString.includes(code.toLowerCase())) {
        return {
          code: errorData.code,
          originalMessage: errorMessage,
          userMessage: errorData.userMessage,
          severity: code === '4001' ? 'warning' : 'error' // User cancellation is warning
        };
      }
    }

    // Check for common contract error patterns
    if (errorString.includes('user rejected') || errorString.includes('user denied')) {
      errorCode = '4001';
    } else if (errorString.includes('insufficient funds') || errorString.includes('insufficient balance')) {
      errorCode = 'INSUFFICIENT_FUNDS';
    } else if (errorString.includes('gas')) {
      errorCode = 'UNPREDICTABLE_GAS_LIMIT';
    } else if (errorString.includes('network') || errorString.includes('connection')) {
      errorCode = 'NETWORK_ERROR';
    } else if (errorString.includes('timeout')) {
      errorCode = 'TIMEOUT';
    } else if (errorString.includes('proof')) {
      errorCode = 'INVALID_PROOF';
    } else if (errorString.includes('nullifier')) {
      errorCode = 'DUPLICATE_NULLIFIER';
    } else if (errorString.includes('member')) {
      errorCode = 'NOT_GROUP_MEMBER';
    } else if (errorString.includes('group')) {
      errorCode = 'INVALID_GROUP';
    } else if (errorString.includes('allocation')) {
      errorCode = 'INVALID_ALLOCATION';
    } else if (errorString.includes('rate limit') || errorString.includes('too many')) {
      errorCode = 'RATE_LIMIT';
    } else if (errorString.includes('server') || errorString.includes('500')) {
      errorCode = 'SERVER_ERROR';
    } else if (errorString.includes('400') || errorString.includes('invalid')) {
      errorCode = 'INVALID_REQUEST';
    }
  } else if (typeof error === 'string') {
    errorMessage = error;
    errorCode = 'STRING_ERROR';
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String((error as { message: unknown }).message);
  }

  const knownError = COMMON_ERROR_CODES[errorCode];
  return {
    code: errorCode,
    originalMessage: errorMessage,
    userMessage: knownError?.userMessage ?? `Something went wrong: ${errorMessage}`,
    severity
  };
}

export function showErrorToast(error: unknown, customMessage?: string): void {
  const parsedError = parseError(error);
  
  const displayMessage = customMessage ?? parsedError.userMessage;
  
  if (parsedError.severity === 'warning') {
    toast(displayMessage, {
      icon: '⚠️',
    });
  } else {
    toast.error(displayMessage);
  }
  
  // Log the original error for debugging
  console.error('Error details:', {
    code: parsedError.code,
    originalMessage: parsedError.originalMessage,
    userMessage: parsedError.userMessage,
    originalError: error
  });
}

export function showSuccessToast(message: string): void {
  toast.success(message);
}

export function showInfoToast(message: string): void {
  toast(message, {
    icon: 'ℹ️',
  });
}

export function showLoadingToast(message: string): string {
  return toast.loading(message);
}

export function dismissToast(toastId: string): void {
  toast.dismiss(toastId);
}

// Utility function to handle async operations with toast feedback
export async function handleAsyncWithToast<T>(
  operation: () => Promise<T>,
  options: {
    loadingMessage: string;
    successMessage: string;
    errorMessage?: string;
  }
): Promise<T | null> {
  const toastId = showLoadingToast(options.loadingMessage);
  
  try {
    const result = await operation();
    dismissToast(toastId);
    showSuccessToast(options.successMessage);
    return result;
  } catch (error) {
    dismissToast(toastId);
    showErrorToast(error, options.errorMessage);
    throw error;
  }
}