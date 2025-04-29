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
      "name": "clientInit",
      "discriminator": [
        200,
        42,
        82,
        229,
        253,
        91,
        189,
        184
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
          "name": "contactDetails",
          "type": "string"
        }
      ]
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
            "name": "contactDetails",
            "type": "string"
          },
          {
            "name": "requiredSkills",
            "type": "string"
          },
          {
            "name": "projectCounter",
            "type": "u64"
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
            "name": "withdrawn",
            "type": "u64"
          },
          {
            "name": "transferred",
            "type": "u64"
          },
          {
            "name": "successRate",
            "type": "f64"
          },
          {
            "name": "riskScore",
            "type": "f64"
          }
        ]
      }
    }
  ]
};
