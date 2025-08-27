import { Abi } from 'viem';

export const abi: Abi = [
    {
      "inputs": [
        {
          "internalType": "contract IPollFactory",
          "name": "_pollFactory",
          "type": "address"
        },
        {
          "internalType": "contract IMessageProcessorFactory",
          "name": "_messageProcessorFactory",
          "type": "address"
        },
        {
          "internalType": "contract ITallyFactory",
          "name": "_tallyFactory",
          "type": "address"
        },
        {
          "internalType": "contract IBasePolicy",
          "name": "_signUpPolicy",
          "type": "address"
        },
        {
          "internalType": "uint8",
          "name": "_stateTreeDepth",
          "type": "uint8"
        },
        {
          "internalType": "uint256[5]",
          "name": "_emptyBallotRoots",
          "type": "uint256[5]"
        }
      ],
      "stateMutability": "payable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "InvalidPublicKey",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "LeafAlreadyExists",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "LeafCannotBeZero",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "LeafGreaterThanSnarkScalarField",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "pollId",
          "type": "uint256"
        }
      ],
      "name": "PollDoesNotExist",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PoseidonHashLibrariesNotLinked",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TooManySignups",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UserNotSignedUp",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_pollId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_coordinatorPublicKeyX",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_coordinatorPublicKeyY",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "enum DomainObjs.Mode",
          "name": "_mode",
          "type": "uint8"
        }
      ],
      "name": "DeployPoll",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_stateIndex",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_timestamp",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_userPublicKeyX",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_userPublicKeyY",
          "type": "uint256"
        }
      ],
      "name": "SignUp",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "MESSAGE_DATA_LENGTH",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "startDate",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "endDate",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "uint8",
                  "name": "tallyProcessingStateTreeDepth",
                  "type": "uint8"
                },
                {
                  "internalType": "uint8",
                  "name": "voteOptionTreeDepth",
                  "type": "uint8"
                },
                {
                  "internalType": "uint8",
                  "name": "stateTreeDepth",
                  "type": "uint8"
                }
              ],
              "internalType": "struct Params.TreeDepths",
              "name": "treeDepths",
              "type": "tuple"
            },
            {
              "internalType": "uint8",
              "name": "messageBatchSize",
              "type": "uint8"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "x",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "y",
                  "type": "uint256"
                }
              ],
              "internalType": "struct DomainObjs.PublicKey",
              "name": "coordinatorPublicKey",
              "type": "tuple"
            },
            {
              "internalType": "address",
              "name": "verifier",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "verifyingKeysRegistry",
              "type": "address"
            },
            {
              "internalType": "enum DomainObjs.Mode",
              "name": "mode",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "policy",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "initialVoiceCreditProxy",
              "type": "address"
            },
            {
              "internalType": "address[]",
              "name": "relayers",
              "type": "address[]"
            },
            {
              "internalType": "uint256",
              "name": "voteOptions",
              "type": "uint256"
            }
          ],
          "internalType": "struct IMACI.DeployPollArgs",
          "name": "args",
          "type": "tuple"
        }
      ],
      "name": "deployPoll",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "poll",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "messageProcessor",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "tally",
              "type": "address"
            }
          ],
          "internalType": "struct IMACI.PollContracts",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "emptyBallotRoots",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_pollId",
          "type": "uint256"
        }
      ],
      "name": "getPoll",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "poll",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "messageProcessor",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "tally",
              "type": "address"
            }
          ],
          "internalType": "struct IMACI.PollContracts",
          "name": "pollContracts",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_publicKeyHash",
          "type": "uint256"
        }
      ],
      "name": "getStateIndex",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_index",
          "type": "uint256"
        }
      ],
      "name": "getStateRootOnIndexedSignUp",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "stateRoot",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getStateTreeRoot",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "root",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[2]",
          "name": "array",
          "type": "uint256[2]"
        }
      ],
      "name": "hash2",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "result",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[3]",
          "name": "array",
          "type": "uint256[3]"
        }
      ],
      "name": "hash3",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "result",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[4]",
          "name": "array",
          "type": "uint256[4]"
        }
      ],
      "name": "hash4",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "result",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[5]",
          "name": "array",
          "type": "uint256[5]"
        }
      ],
      "name": "hash5",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "result",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "left",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "right",
          "type": "uint256"
        }
      ],
      "name": "hashLeftRight",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "result",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "leanIMTData",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "size",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "depth",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "maxSignups",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "messageProcessorFactory",
      "outputs": [
        {
          "internalType": "contract IMessageProcessorFactory",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextPollId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pollFactory",
      "outputs": [
        {
          "internalType": "contract IPollFactory",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "polls",
      "outputs": [
        {
          "internalType": "address",
          "name": "poll",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "messageProcessor",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "tally",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "array",
          "type": "uint256[]"
        }
      ],
      "name": "sha256Hash",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "result",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "x",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "y",
              "type": "uint256"
            }
          ],
          "internalType": "struct DomainObjs.PublicKey",
          "name": "_publicKey",
          "type": "tuple"
        },
        {
          "internalType": "bytes",
          "name": "_signUpPolicyData",
          "type": "bytes"
        }
      ],
      "name": "signUp",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "signUpPolicy",
      "outputs": [
        {
          "internalType": "contract IBasePolicy",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "stateRootsOnSignUp",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "stateTreeDepth",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "tallyFactory",
      "outputs": [
        {
          "internalType": "contract ITallyFactory",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSignups",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "signUps",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]