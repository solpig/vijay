/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/vijay.json`.
 */
export type Vijay = {
  "address": "HQY5kLNtUJkEiArKxDyrkCKHBtK8pDFGUBifrGFjtLDt",
  "metadata": {
    "name": "vijay",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initializeClient",
      "discriminator": [
        160,
        113,
        132,
        124,
        243,
        236,
        21,
        99
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "client",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "clientReportCard",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116,
                  95,
                  114,
                  101,
                  112,
                  111,
                  114,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "domain",
          "type": "string"
        },
        {
          "name": "requiredSkills",
          "type": "string"
        },
        {
          "name": "contact",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeFreelancer",
      "discriminator": [
        182,
        60,
        59,
        193,
        161,
        141,
        191,
        116
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "freelancer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  114,
                  101,
                  101,
                  108,
                  97,
                  110,
                  99,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "freelancerReportCard",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  114,
                  101,
                  101,
                  108,
                  97,
                  110,
                  99,
                  101,
                  114,
                  95,
                  114,
                  101,
                  112,
                  111,
                  114,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "domain",
          "type": "string"
        },
        {
          "name": "skills",
          "type": "string"
        },
        {
          "name": "contact",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeProject",
      "discriminator": [
        69,
        126,
        215,
        37,
        20,
        60,
        73,
        235
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "client",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "project",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116,
                  95,
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "client.project_counter.checked_add(1)",
                "account": "client"
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "url",
          "type": "string"
        },
        {
          "name": "budget",
          "type": "u64"
        }
      ]
    },
    {
      "name": "projectEscrowSetup",
      "discriminator": [
        16,
        53,
        104,
        225,
        12,
        112,
        90,
        207
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "project",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116,
                  95,
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "projectId"
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "freelancer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  114,
                  101,
                  101,
                  108,
                  97,
                  110,
                  99,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "freelancerKey"
              }
            ]
          }
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "project.name",
                "account": "project"
              },
              {
                "kind": "account",
                "path": "project.owner",
                "account": "project"
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
                "kind": "account",
                "path": "project.name",
                "account": "project"
              },
              {
                "kind": "account",
                "path": "project.owner",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "freelancerProject",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  114,
                  101,
                  101,
                  108,
                  97,
                  110,
                  99,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "project.name",
                "account": "project"
              },
              {
                "kind": "account",
                "path": "freelancer.project_counter.checked_add(1)",
                "account": "freelancer"
              },
              {
                "kind": "account",
                "path": "freelancer.owner",
                "account": "freelancer"
              }
            ]
          }
        },
        {
          "name": "freelancerReportCard",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  114,
                  101,
                  101,
                  108,
                  97,
                  110,
                  99,
                  101,
                  114,
                  95,
                  114,
                  101,
                  112,
                  111,
                  114,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "freelancer.owner",
                "account": "freelancer"
              }
            ]
          }
        },
        {
          "name": "clientReportCard",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116,
                  95,
                  114,
                  101,
                  112,
                  111,
                  114,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "projectId",
          "type": "u64"
        },
        {
          "name": "freelancerKey",
          "type": "pubkey"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "totalTasks",
          "type": "u64"
        }
      ]
    },
    {
      "name": "requestTaskReview",
      "discriminator": [
        159,
        153,
        152,
        117,
        254,
        163,
        126,
        49
      ],
      "accounts": [
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "freelancerProject",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  114,
                  101,
                  101,
                  108,
                  97,
                  110,
                  99,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "projectName"
              },
              {
                "kind": "arg",
                "path": "freelancerProjectId"
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "projectName",
          "type": "string"
        },
        {
          "name": "freelancerProjectId",
          "type": "u64"
        },
        {
          "name": "url",
          "type": "string"
        }
      ]
    },
    {
      "name": "reviewTaskProcess",
      "discriminator": [
        239,
        57,
        131,
        246,
        43,
        104,
        129,
        32
      ],
      "accounts": [
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "project",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116,
                  95,
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "projectId"
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "freelancerProject",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  114,
                  101,
                  101,
                  108,
                  97,
                  110,
                  99,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "project.name",
                "account": "project"
              },
              {
                "kind": "account",
                "path": "project.assigned_freelancer_project_id",
                "account": "project"
              },
              {
                "kind": "account",
                "path": "project.assigned_freelancer",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "project.name",
                "account": "project"
              },
              {
                "kind": "account",
                "path": "project.owner",
                "account": "project"
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
                "kind": "account",
                "path": "project.name",
                "account": "project"
              },
              {
                "kind": "account",
                "path": "project.owner",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "freelancerReportCard",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  114,
                  101,
                  101,
                  108,
                  97,
                  110,
                  99,
                  101,
                  114,
                  95,
                  114,
                  101,
                  112,
                  111,
                  114,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "project.assigned_freelancer",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "clientReportCard",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116,
                  95,
                  114,
                  101,
                  112,
                  111,
                  114,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "receiver",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "projectId",
          "type": "u64"
        },
        {
          "name": "approve",
          "type": "bool"
        }
      ]
    },
    {
      "name": "transferProject",
      "discriminator": [
        164,
        123,
        142,
        233,
        67,
        142,
        71,
        148
      ],
      "accounts": [
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "project",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116,
                  95,
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "projectId"
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "project.name",
                "account": "project"
              },
              {
                "kind": "account",
                "path": "project.owner",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "freelancerProject",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  114,
                  101,
                  101,
                  108,
                  97,
                  110,
                  99,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "project.name",
                "account": "project"
              },
              {
                "kind": "account",
                "path": "project.assigned_freelancer_project_id",
                "account": "project"
              },
              {
                "kind": "account",
                "path": "project.assigned_freelancer",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "freelancerReport",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  114,
                  101,
                  101,
                  108,
                  97,
                  110,
                  99,
                  101,
                  114,
                  95,
                  114,
                  101,
                  112,
                  111,
                  114,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "project.assigned_freelancer",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "clientReportCard",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116,
                  95,
                  114,
                  101,
                  112,
                  111,
                  114,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "freelancer",
          "type": "pubkey"
        },
        {
          "name": "freelancerProjectId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawProject",
      "discriminator": [
        8,
        130,
        133,
        212,
        253,
        104,
        252,
        145
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "project",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116,
                  95,
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "projectId"
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "project.name",
                "account": "project"
              },
              {
                "kind": "account",
                "path": "project.owner",
                "account": "project"
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
                "kind": "account",
                "path": "project.name",
                "account": "project"
              },
              {
                "kind": "account",
                "path": "project.owner",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "freelancerProject",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  114,
                  101,
                  101,
                  108,
                  97,
                  110,
                  99,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "project.name",
                "account": "project"
              },
              {
                "kind": "account",
                "path": "project.assigned_freelancer_project_id",
                "account": "project"
              },
              {
                "kind": "account",
                "path": "project.assigned_freelancer",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "freelancerReportCard",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  114,
                  101,
                  101,
                  108,
                  97,
                  110,
                  99,
                  101,
                  114,
                  95,
                  114,
                  101,
                  112,
                  111,
                  114,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "project.assigned_freelancer",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "clientReportCard",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  105,
                  101,
                  110,
                  116,
                  95,
                  114,
                  101,
                  112,
                  111,
                  114,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "client",
      "discriminator": [
        221,
        237,
        145,
        143,
        170,
        194,
        133,
        115
      ]
    },
    {
      "name": "clientReportCard",
      "discriminator": [
        152,
        9,
        86,
        14,
        195,
        112,
        4,
        187
      ]
    },
    {
      "name": "escrow",
      "discriminator": [
        31,
        213,
        123,
        187,
        186,
        22,
        218,
        155
      ]
    },
    {
      "name": "freelancer",
      "discriminator": [
        85,
        117,
        113,
        118,
        145,
        222,
        67,
        98
      ]
    },
    {
      "name": "freelancerProject",
      "discriminator": [
        103,
        239,
        90,
        213,
        230,
        160,
        32,
        251
      ]
    },
    {
      "name": "freelancerReportCard",
      "discriminator": [
        183,
        27,
        241,
        217,
        1,
        41,
        241,
        179
      ]
    },
    {
      "name": "project",
      "discriminator": [
        205,
        168,
        189,
        202,
        181,
        247,
        142,
        19
      ]
    },
    {
      "name": "vault",
      "discriminator": [
        211,
        8,
        232,
        43,
        2,
        152,
        117,
        119
      ]
    }
  ],
  "events": [
    {
      "name": "reviewRequested",
      "discriminator": [
        138,
        245,
        234,
        140,
        80,
        2,
        101,
        150
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "numericalOverflow",
      "msg": "Overflow occurred during math operation"
    },
    {
      "code": 6001,
      "name": "unAuthorizedSetup",
      "msg": "Only project owner allowed to setup the escrow"
    },
    {
      "code": 6002,
      "name": "unAuthorizedReviewer",
      "msg": "Only project owner allowed to review the project"
    },
    {
      "code": 6003,
      "name": "escrowInActive",
      "msg": "Escrow account is inactive"
    },
    {
      "code": 6004,
      "name": "projectInActive",
      "msg": "Project is inactive"
    },
    {
      "code": 6005,
      "name": "freelancerProjectInActive",
      "msg": "Freelancer project is inactive"
    },
    {
      "code": 6006,
      "name": "tasksCompleted",
      "msg": "All the tasks have been completed"
    },
    {
      "code": 6007,
      "name": "notAnOwner",
      "msg": "Only owner is allowed to proceed with this operation"
    },
    {
      "code": 6008,
      "name": "taskReviewNotRequested",
      "msg": "Task review not yet requested"
    }
  ],
  "types": [
    {
      "name": "client",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "domain",
            "type": "string"
          },
          {
            "name": "contact",
            "type": "string"
          },
          {
            "name": "requiredSkills",
            "type": "string"
          },
          {
            "name": "projectCounter",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "clientReportCard",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalProjects",
            "type": "u64"
          },
          {
            "name": "projectsInProgress",
            "type": "u64"
          },
          {
            "name": "completed",
            "type": "u64"
          },
          {
            "name": "withdrawn",
            "type": "u64"
          },
          {
            "name": "transferred",
            "type": "u64"
          },
          {
            "name": "successRate",
            "type": "u16"
          },
          {
            "name": "riskScore",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "escrow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "depositor",
            "type": "pubkey"
          },
          {
            "name": "receiver",
            "type": "pubkey"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "budget",
            "type": "u64"
          },
          {
            "name": "totalTasks",
            "type": "u64"
          },
          {
            "name": "tasksCompleted",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "freelancer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "domain",
            "type": "string"
          },
          {
            "name": "skills",
            "type": "string"
          },
          {
            "name": "contact",
            "type": "string"
          },
          {
            "name": "projectCounter",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "freelancerProject",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "completedTaskUrl",
            "type": "string"
          },
          {
            "name": "projectName",
            "type": "string"
          },
          {
            "name": "projectClient",
            "type": "pubkey"
          },
          {
            "name": "approvedTasks",
            "type": "u64"
          },
          {
            "name": "rejectedTasks",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "freelancerReportCard",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalProjects",
            "type": "u64"
          },
          {
            "name": "projectsInProgress",
            "type": "u64"
          },
          {
            "name": "completed",
            "type": "u64"
          },
          {
            "name": "rejected",
            "type": "u64"
          },
          {
            "name": "successRate",
            "type": "u16"
          },
          {
            "name": "riskScore",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "project",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "url",
            "type": "string"
          },
          {
            "name": "budget",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "inProgress",
            "type": "bool"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "assignedFreelancer",
            "type": "pubkey"
          },
          {
            "name": "assignedFreelancerProjectId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "reviewRequested",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "projectName",
            "type": "string"
          },
          {
            "name": "projectOwner",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "vault",
      "type": {
        "kind": "struct",
        "fields": []
      }
    }
  ]
};
