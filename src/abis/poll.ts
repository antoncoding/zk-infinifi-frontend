import { Abi } from 'viem';

export const poolAbi: Abi = [
    {
      "inputs": [],
      "name": "AlreadyInitialized",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "BatchHashesAlreadyPadded",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "DefaultZeroBadIndex",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "DepthTooLarge",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidBatchLength",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidMessage",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidPollProof",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidPublicKey",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotRelayer",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NumberOfLeavesCannotBeZero",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PollAlreadyInit",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "StateAlreadyMerged",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "StateLeafNotFound",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TooManyMessages",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TooManySignups",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TooManyVoteOptions",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UserAlreadyJoined",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "VotingPeriodNotOver",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "VotingPeriodNotStarted",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "VotingPeriodOver",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_chainHash",
          "type": "uint256"
        }
      ],
      "name": "ChainHashUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "_ipfsHash",
          "type": "bytes32"
        }
      ],
      "name": "IpfsHashAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_stateRoot",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_totalSignups",
          "type": "uint256"
        }
      ],
      "name": "MergeState",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_pollPublicKeyX",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_pollPublicKeyY",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_voiceCreditBalance",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_nullifier",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_pollStateIndex",
          "type": "uint256"
        }
      ],
      "name": "PollJoined",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256[10]",
              "name": "data",
              "type": "uint256[10]"
            }
          ],
          "indexed": false,
          "internalType": "struct DomainObjs.Message",
          "name": "_message",
          "type": "tuple"
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
          "indexed": false,
          "internalType": "struct DomainObjs.PublicKey",
          "name": "_encryptionPublicKey",
          "type": "tuple"
        }
      ],
      "name": "PublishMessage",
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
      "inputs": [],
      "name": "actualStateTreeDepth",
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
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "batchHashes",
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
      "name": "chainHash",
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
      "name": "coordinatorPublicKey",
      "outputs": [
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
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "coordinatorPublicKeyHash",
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
      "name": "currentSbCommitment",
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
      "name": "emptyBallotRoot",
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
      "name": "endDate",
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
      "name": "extContracts",
      "outputs": [
        {
          "internalType": "contract IMACI",
          "name": "maci",
          "type": "address"
        },
        {
          "internalType": "contract IVerifier",
          "name": "verifier",
          "type": "address"
        },
        {
          "internalType": "contract IVerifyingKeysRegistry",
          "name": "verifyingKeysRegistry",
          "type": "address"
        },
        {
          "internalType": "contract IBasePolicy",
          "name": "policy",
          "type": "address"
        },
        {
          "internalType": "contract IInitialVoiceCreditProxy",
          "name": "initialVoiceCreditProxy",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAppendedBytes",
      "outputs": [
        {
          "internalType": "bytes",
          "name": "appendedBytes",
          "type": "bytes"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getBatchHashes",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getMaciContract",
      "outputs": [
        {
          "internalType": "contract IMACI",
          "name": "maci",
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
          "name": "_index",
          "type": "uint256"
        }
      ],
      "name": "getPublicJoinedCircuitInputs",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "publicInputs",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_nullifier",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_index",
          "type": "uint256"
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
          "name": "_publicKey",
          "type": "tuple"
        }
      ],
      "name": "getPublicJoiningCircuitInputs",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "publicInputs",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getStartAndEndDate",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "pollStartDate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "pollEndDate",
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
          "name": "element",
          "type": "uint256"
        }
      ],
      "name": "getStateIndex",
      "outputs": [
        {
          "internalType": "uint40",
          "name": "",
          "type": "uint40"
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
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256[10]",
              "name": "data",
              "type": "uint256[10]"
            }
          ],
          "internalType": "struct DomainObjs.Message",
          "name": "_message",
          "type": "tuple"
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
          "name": "_encryptionPublicKey",
          "type": "tuple"
        }
      ],
      "name": "hashMessageAndPublicKey",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "msgHash",
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
              "name": "publicKey",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "voiceCreditBalance",
              "type": "uint256"
            }
          ],
          "internalType": "struct DomainObjs.StateLeaf",
          "name": "_stateLeaf",
          "type": "tuple"
        }
      ],
      "name": "hashStateLeaf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "ciphertext",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "initialized",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
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
      "name": "ipfsHashes",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "isBatchHashesPadded",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_nullifier",
          "type": "uint256"
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
          "name": "_publicKey",
          "type": "tuple"
        },
        {
          "internalType": "uint256",
          "name": "_stateRootIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256[8]",
          "name": "_proof",
          "type": "uint256[8]"
        },
        {
          "internalType": "bytes",
          "name": "_signUpPolicyData",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "_initialVoiceCreditProxyData",
          "type": "bytes"
        }
      ],
      "name": "joinPoll",
      "outputs": [],
      "stateMutability": "nonpayable",
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
      "name": "mergeState",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "mergedStateRoot",
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
      "name": "messageBatchSize",
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
      "name": "numMessages",
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
          "internalType": "uint256[2]",
          "name": "dataToPad",
          "type": "uint256[2]"
        }
      ],
      "name": "padAndHashMessage",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256[10]",
              "name": "data",
              "type": "uint256[10]"
            }
          ],
          "internalType": "struct DomainObjs.Message",
          "name": "message",
          "type": "tuple"
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
          "name": "padKey",
          "type": "tuple"
        },
        {
          "internalType": "uint256",
          "name": "msgHash",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "padLastBatch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pollId",
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
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "pollNullifiers",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
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
      "name": "pollStateRootsOnJoin",
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
      "name": "pollStateTree",
      "outputs": [
        {
          "internalType": "uint40",
          "name": "maxIndex",
          "type": "uint40"
        },
        {
          "internalType": "uint40",
          "name": "numberOfLeaves",
          "type": "uint40"
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
              "internalType": "uint256[10]",
              "name": "data",
              "type": "uint256[10]"
            }
          ],
          "internalType": "struct DomainObjs.Message",
          "name": "_message",
          "type": "tuple"
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
          "name": "_encryptionPublicKey",
          "type": "tuple"
        }
      ],
      "name": "publishMessage",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256[10]",
              "name": "data",
              "type": "uint256[10]"
            }
          ],
          "internalType": "struct DomainObjs.Message[]",
          "name": "_messages",
          "type": "tuple[]"
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
          "internalType": "struct DomainObjs.PublicKey[]",
          "name": "_encryptionPublicKeys",
          "type": "tuple[]"
        }
      ],
      "name": "publishMessageBatch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "_messageHashes",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes32",
          "name": "_ipfsHash",
          "type": "bytes32"
        }
      ],
      "name": "relayMessagesBatch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "relayers",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
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
      "inputs": [],
      "name": "startDate",
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
      "name": "stateMerged",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
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
          "name": "signups",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSignupsAndMessages",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "numSUps",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "numMsgs",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "treeDepths",
      "outputs": [
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
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_index",
          "type": "uint256"
        },
        {
          "internalType": "uint256[8]",
          "name": "_proof",
          "type": "uint256[8]"
        }
      ],
      "name": "verifyJoinedPollProof",
      "outputs": [
        {
          "internalType": "bool",
          "name": "isValid",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_nullifier",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_index",
          "type": "uint256"
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
          "name": "_publicKey",
          "type": "tuple"
        },
        {
          "internalType": "uint256[8]",
          "name": "_proof",
          "type": "uint256[8]"
        }
      ],
      "name": "verifyJoiningPollProof",
      "outputs": [
        {
          "internalType": "bool",
          "name": "isValid",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "voteOptions",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];