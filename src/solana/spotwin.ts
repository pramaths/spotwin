/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/spotwin.json`.
 */
export type Spotwin = {
  "address": "9ADHDvAGodZkqeQm1XEEQimYaUM9LRJ2z7dp37zdSdDr",
  "metadata": {
    "name": "spotwin",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createContest",
      "discriminator": [
        129,
        189,
        164,
        27,
        152,
        242,
        123,
        93
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "contest",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "contestId"
              },
              {
                "kind": "account",
                "path": "poolMint"
              }
            ]
          }
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "contestId"
              }
            ]
          }
        },
        {
          "name": "poolMint"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "contestId",
          "type": "u64"
        },
        {
          "name": "entryFee",
          "type": "u64"
        },
        {
          "name": "lockSlot",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [],
      "args": []
    },
    {
      "name": "initializeStake",
      "discriminator": [
        33,
        175,
        216,
        4,
        116,
        130,
        164,
        177
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "Whoever pays the rent (you, or a deployer script)"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "poolMint",
          "docs": [
            "The SPL mint users will stake (USDC / SPOT)"
          ]
        },
        {
          "name": "stakeVault",
          "docs": [
            "PDA that will hold all staked tokens"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "stakeAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "joinContest",
      "discriminator": [
        247,
        243,
        77,
        111,
        247,
        254,
        100,
        133
      ],
      "accounts": [
        {
          "name": "player",
          "writable": true,
          "signer": true
        },
        {
          "name": "feePayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "contest",
          "writable": true
        },
        {
          "name": "participant",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  114,
                  116,
                  105,
                  99,
                  105,
                  112,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "contestId"
              },
              {
                "kind": "account",
                "path": "player"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "contestId"
              },
              {
                "kind": "account",
                "path": "poolMint"
              }
            ]
          }
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "contestId"
              }
            ]
          }
        },
        {
          "name": "playerToken",
          "writable": true
        },
        {
          "name": "poolMint",
          "relations": [
            "contest"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "contestId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "lockContest",
      "discriminator": [
        124,
        155,
        70,
        224,
        136,
        196,
        104,
        207
      ],
      "accounts": [
        {
          "name": "creator",
          "signer": true,
          "relations": [
            "contest"
          ]
        },
        {
          "name": "contest",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "contestId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "postAnswerKey",
      "discriminator": [
        233,
        243,
        110,
        148,
        243,
        10,
        192,
        252
      ],
      "accounts": [
        {
          "name": "creator",
          "signer": true,
          "relations": [
            "contest"
          ]
        },
        {
          "name": "contest",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "contestId",
          "type": "u64"
        },
        {
          "name": "answerKey",
          "type": "u16"
        }
      ]
    },
    {
      "name": "postPayoutRoot",
      "discriminator": [
        210,
        236,
        116,
        91,
        67,
        233,
        80,
        135
      ],
      "accounts": [
        {
          "name": "creator",
          "signer": true,
          "relations": [
            "contest"
          ]
        },
        {
          "name": "contest",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "contestId",
          "type": "u64"
        },
        {
          "name": "payoutRoot",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "winnerCount",
          "type": "u32"
        }
      ]
    },
    {
      "name": "sendBatch",
      "discriminator": [
        212,
        9,
        35,
        132,
        25,
        80,
        77,
        213
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "relations": [
            "contest"
          ]
        },
        {
          "name": "contest",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "contestId"
              },
              {
                "kind": "account",
                "path": "poolMint"
              }
            ]
          }
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "contestId"
              }
            ]
          }
        },
        {
          "name": "poolMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "contestId",
          "type": "u64"
        },
        {
          "name": "winners",
          "type": {
            "vec": "pubkey"
          }
        },
        {
          "name": "amounts",
          "type": {
            "vec": "u64"
          }
        }
      ]
    },
    {
      "name": "stakeTokens",
      "discriminator": [
        136,
        126,
        91,
        162,
        40,
        131,
        13,
        127
      ],
      "accounts": [
        {
          "name": "staker",
          "writable": true,
          "signer": true
        },
        {
          "name": "stakeAcct",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "staker"
              }
            ]
          }
        },
        {
          "name": "stakeVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "stakeAuthority",
          "docs": [
            "only used with `invoke_signed` to move tokens in/out."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              }
            ]
          }
        },
        {
          "name": "stakerAta",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unstakeTokens",
      "discriminator": [
        58,
        119,
        215,
        143,
        203,
        223,
        32,
        86
      ],
      "accounts": [
        {
          "name": "staker",
          "writable": true,
          "signer": true
        },
        {
          "name": "stakeAcct",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "staker"
              }
            ]
          }
        },
        {
          "name": "stakeVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "stakeAuthority",
          "docs": [
            "only used with `invoke_signed` to move tokens in/out."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              }
            ]
          }
        },
        {
          "name": "stakerAta",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateAnswers",
      "discriminator": [
        64,
        230,
        55,
        224,
        174,
        65,
        57,
        194
      ],
      "accounts": [
        {
          "name": "player",
          "writable": true,
          "signer": true
        },
        {
          "name": "contest",
          "writable": true
        },
        {
          "name": "participant",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  114,
                  116,
                  105,
                  99,
                  105,
                  112,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "contestId"
              },
              {
                "kind": "account",
                "path": "player"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "contestId",
          "type": "u64"
        },
        {
          "name": "newAnswerBits",
          "type": "u16"
        },
        {
          "name": "newAttemptMask",
          "type": "u16"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "contest",
      "discriminator": [
        216,
        26,
        88,
        18,
        251,
        80,
        201,
        96
      ]
    },
    {
      "name": "participant",
      "discriminator": [
        32,
        142,
        108,
        79,
        247,
        179,
        54,
        6
      ]
    },
    {
      "name": "stakeAccount",
      "discriminator": [
        80,
        158,
        67,
        124,
        50,
        189,
        192,
        255
      ]
    }
  ],
  "events": [
    {
      "name": "joined",
      "discriminator": [
        16,
        20,
        44,
        48,
        132,
        189,
        68,
        98
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "contestClosed",
      "msg": "Contest is closed or not accepting entries"
    },
    {
      "code": 6001,
      "name": "numericalOverflow",
      "msg": "Arithmetic overflow occurred"
    },
    {
      "code": 6002,
      "name": "invalidAttemptMask",
      "msg": "Must attempt exactly 9 questions"
    },
    {
      "code": 6003,
      "name": "invalidAnswerBits",
      "msg": "Answer bits outside attempted mask"
    },
    {
      "code": 6004,
      "name": "invalidOwner",
      "msg": "Invalid owner"
    },
    {
      "code": 6005,
      "name": "invalidMint",
      "msg": "Invalid mint"
    },
    {
      "code": 6006,
      "name": "invalidAnswerKey",
      "msg": "Invalid answer key"
    },
    {
      "code": 6007,
      "name": "invalidArguments",
      "msg": "winners and amounts must have same non-zero length"
    },
    {
      "code": 6008,
      "name": "emptyBatch",
      "msg": "batch cannot be empty"
    },
    {
      "code": 6009,
      "name": "invalidParticipant",
      "msg": "provided account is not a valid participant PDA for this contest"
    },
    {
      "code": 6010,
      "name": "contestNotAnswerKeyPosted",
      "msg": "Contest is not in the correct state"
    },
    {
      "code": 6011,
      "name": "contestNotLocked",
      "msg": "Contest is not in the correct state"
    },
    {
      "code": 6012,
      "name": "answerKeyNotSet",
      "msg": "Contest is not in the correct state"
    },
    {
      "code": 6013,
      "name": "invalidWinnerCount",
      "msg": "Invalid winner count"
    },
    {
      "code": 6014,
      "name": "invalidContestId",
      "msg": "Invalid contest id passed"
    },
    {
      "code": 6015,
      "name": "stakeLocked",
      "msg": "Stake is locked"
    },
    {
      "code": 6016,
      "name": "invalidUnstakeAmount",
      "msg": "Invalid unstake amount"
    }
  ],
  "types": [
    {
      "name": "contest",
      "docs": [
        "Contest account"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "contestId",
            "type": "u64"
          },
          {
            "name": "poolMint",
            "type": "pubkey"
          },
          {
            "name": "entryFee",
            "type": "u64"
          },
          {
            "name": "lockSlot",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "contestStatus"
              }
            }
          },
          {
            "name": "totalEntries",
            "type": "u32"
          },
          {
            "name": "answerKey",
            "type": "u16"
          },
          {
            "name": "payoutRoot",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "winnerCount",
            "type": "u32"
          },
          {
            "name": "paidSoFar",
            "type": "u64"
          },
          {
            "name": "contestBump",
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          },
          {
            "name": "vaultAuthorityBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "contestStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "open"
          },
          {
            "name": "locked"
          },
          {
            "name": "answerKeyPosted"
          },
          {
            "name": "settled"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    },
    {
      "name": "joined",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "contestId",
            "type": "u64"
          },
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "slot",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "participant",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "attemptMask",
            "type": "u16"
          },
          {
            "name": "answerBits",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "stakeAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "startSlot",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
