/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/shoot_9_solana.json`.
 */
export type Shoot9Solana = {
  address: '8x6gwoJY88dG9aJ27wJ79nLcRw6bkZEUKJxfM5CPg6NS';
  metadata: {
    name: 'shoot9Solana';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Created with Anchor';
  };
  instructions: [
    {
      name: 'createContest';
      discriminator: [129, 189, 164, 27, 152, 242, 123, 93];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'contest';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 111, 110, 116, 101, 115, 116];
              },
              {
                kind: 'account';
                path: 'authority';
              },
              {
                kind: 'arg';
                path: 'contestId';
              },
            ];
          };
        },
        {
          name: 'authStore';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [97, 117, 116, 104, 95, 115, 116, 111, 114, 101];
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'contestId';
          type: 'u64';
        },
        {
          name: 'entryFee';
          type: 'u64';
        },
        {
          name: 'name';
          type: 'string';
        },
        {
          name: 'feeReceiver';
          type: {
            option: 'pubkey';
          };
        },
      ];
    },
    {
      name: 'enterContest';
      discriminator: [124, 21, 89, 144, 102, 156, 149, 232];
      accounts: [
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'contest';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 111, 110, 116, 101, 115, 116];
              },
              {
                kind: 'account';
                path: 'contest.authority';
                account: 'contestAccount';
              },
              {
                kind: 'account';
                path: 'contest.contest_id';
                account: 'contestAccount';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'initializeAuth';
      discriminator: [166, 7, 9, 80, 238, 156, 78, 240];
      accounts: [
        {
          name: 'admin';
          writable: true;
          signer: true;
        },
        {
          name: 'authStore';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [97, 117, 116, 104, 95, 115, 116, 111, 114, 101];
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [];
    },
    {
      name: 'removeCreatorAuth';
      discriminator: [68, 87, 97, 100, 207, 175, 86, 8];
      accounts: [
        {
          name: 'admin';
          writable: true;
          signer: true;
        },
        {
          name: 'authStore';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [97, 117, 116, 104, 95, 115, 116, 111, 114, 101];
              },
            ];
          };
        },
      ];
      args: [
        {
          name: 'creator';
          type: 'pubkey';
        },
      ];
    },
    {
      name: 'resolveContest';
      discriminator: [250, 181, 233, 153, 74, 161, 231, 115];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'contest';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 111, 110, 116, 101, 115, 116];
              },
              {
                kind: 'account';
                path: 'contest.authority';
                account: 'contestAccount';
              },
              {
                kind: 'account';
                path: 'contest.contest_id';
                account: 'contestAccount';
              },
            ];
          };
        },
        {
          name: 'authStore';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [97, 117, 116, 104, 95, 115, 116, 111, 114, 101];
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'winners';
          type: {
            vec: 'pubkey';
          };
        },
        {
          name: 'payouts';
          type: {
            vec: 'u64';
          };
        },
      ];
    },
    {
      name: 'updateCreatorAuth';
      discriminator: [37, 5, 150, 199, 63, 239, 164, 80];
      accounts: [
        {
          name: 'admin';
          writable: true;
          signer: true;
        },
        {
          name: 'authStore';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [97, 117, 116, 104, 95, 115, 116, 111, 114, 101];
              },
            ];
          };
        },
      ];
      args: [
        {
          name: 'creator';
          type: 'pubkey';
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'authStore';
      discriminator: [57, 101, 106, 77, 129, 125, 93, 119];
    },
    {
      name: 'contestAccount';
      discriminator: [83, 124, 58, 73, 7, 52, 28, 230];
    },
  ];
  events: [
    {
      name: 'authInitialized';
      discriminator: [104, 15, 223, 238, 122, 34, 247, 165];
    },
    {
      name: 'contestCreated';
      discriminator: [132, 15, 183, 141, 44, 207, 42, 86];
    },
    {
      name: 'contestEntered';
      discriminator: [145, 200, 149, 193, 48, 234, 114, 31];
    },
    {
      name: 'contestResolved';
      discriminator: [58, 234, 191, 188, 108, 208, 69, 78];
    },
    {
      name: 'creatorAuthorizationRemoved';
      discriminator: [147, 121, 228, 0, 8, 143, 37, 167];
    },
    {
      name: 'creatorAuthorizationUpdated';
      discriminator: [193, 89, 57, 13, 168, 211, 164, 85];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'unauthorized';
      msg: 'Unauthorized access';
    },
    {
      code: 6001;
      name: 'overflow';
      msg: 'Arithmetic overflow';
    },
    {
      code: 6002;
      name: 'invalidWinnersCount';
      msg: 'Invalid number of winners';
    },
    {
      code: 6003;
      name: 'insufficientPool';
      msg: 'Insufficient pool balance';
    },
    {
      code: 6004;
      name: 'invalidContestStatus';
      msg: 'Invalid contest status';
    },
    {
      code: 6005;
      name: 'missingWinnerAccount';
      msg: 'Missing winner account';
    },
    {
      code: 6006;
      name: 'incorrectAmount';
      msg: 'Incorrect entry fee amount';
    },
  ];
  types: [
    {
      name: 'authInitialized';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'admin';
            type: 'pubkey';
          },
          {
            name: 'timestamp';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'authStore';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'admin';
            type: 'pubkey';
          },
          {
            name: 'authorizedCreators';
            type: {
              vec: 'pubkey';
            };
          },
        ];
      };
    },
    {
      name: 'contestAccount';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'authority';
            type: 'pubkey';
          },
          {
            name: 'contestId';
            type: 'u64';
          },
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'entryFee';
            type: 'u64';
          },
          {
            name: 'feeReceiver';
            type: 'pubkey';
          },
          {
            name: 'status';
            type: {
              defined: {
                name: 'contestStatus';
              };
            };
          },
          {
            name: 'totalPool';
            type: 'u64';
          },
          {
            name: 'participants';
            type: {
              vec: 'pubkey';
            };
          },
          {
            name: 'bump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'contestCreated';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'contest';
            type: 'pubkey';
          },
          {
            name: 'contestId';
            type: 'u64';
          },
          {
            name: 'entryFee';
            type: 'u64';
          },
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'feeReceiver';
            type: 'pubkey';
          },
          {
            name: 'timestamp';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'contestEntered';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'contest';
            type: 'pubkey';
          },
          {
            name: 'contestId';
            type: 'u64';
          },
          {
            name: 'user';
            type: 'pubkey';
          },
          {
            name: 'amount';
            type: 'u64';
          },
          {
            name: 'timestamp';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'contestResolved';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'contest';
            type: 'pubkey';
          },
          {
            name: 'contestId';
            type: 'u64';
          },
          {
            name: 'winnersCount';
            type: 'u64';
          },
          {
            name: 'totalPayout';
            type: 'u64';
          },
          {
            name: 'feeReceiver';
            type: 'pubkey';
          },
          {
            name: 'feeAmount';
            type: 'u64';
          },
          {
            name: 'timestamp';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'contestStatus';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'open';
          },
          {
            name: 'resolved';
          },
          {
            name: 'cancelled';
          },
        ];
      };
    },
    {
      name: 'creatorAuthorizationRemoved';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'creator';
            type: 'pubkey';
          },
          {
            name: 'authorized';
            type: 'bool';
          },
          {
            name: 'timestamp';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'creatorAuthorizationUpdated';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'creator';
            type: 'pubkey';
          },
          {
            name: 'authorized';
            type: 'bool';
          },
          {
            name: 'timestamp';
            type: 'i64';
          },
        ];
      };
    },
  ];
};
