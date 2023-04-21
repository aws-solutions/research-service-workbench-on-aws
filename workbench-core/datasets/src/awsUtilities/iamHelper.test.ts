/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { PolicyDocument, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { IamHelper } from './iamHelper';

describe('IamHelper', () => {
  describe('compareStatementPrincipal', () => {
    it('returns false when source has a principal and target does not.', () => {
      const source = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Action": "*",
          "Effect": "Allow",
          "Resource": "*"
        }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Effect": "Allow",
          "Action": "*",
          "Resource": "*"
        }
      `)
      );
      expect(IamHelper.compareStatementPrincipal(source, target)).toBe(false);
    });

    it('returns false when source has no principal but target does.', () => {
      const source = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Action": "*",
          "Effect": "Allow",
          "Resource": "*"
        }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Effect": "Allow",
          "Action": "*",
          "Resource": "*"
        }
      `)
      );
      expect(IamHelper.compareStatementPrincipal(source, target)).toBe(false);
    });

    it('returns false when the source and target principals do not match.', () => {
      const source = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Action": "*",
          "Effect": "Allow",
          "Resource": "*"
        }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "arn:aws:iam::123456789012:role/someRole"
          },
          "Effect": "Allow",
          "Action": "*",
          "Resource": "*"
        }
      `)
      );
      expect(IamHelper.compareStatementPrincipal(source, target)).toBe(false);
    });

    it('returns true when the source and target principals match.', () => {
      const source = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Action": "*",
          "Effect": "Allow",
          "Resource": "*"
        }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Effect": "Allow",
          "Action": "*",
          "Resource": "*"
        }
      `)
      );
      expect(IamHelper.compareStatementPrincipal(source, target)).toBe(true);
    });
  });

  describe('compareStatementEffect', () => {
    it('returns false when the source and target effects do not match.', () => {
      const source = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Action": "*",
          "Effect": "Allow",
          "Resource": "*"
        }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Effect": "Deny",
          "Action": "*",
          "Resource": "*"
        }
      `)
      );
      expect(IamHelper.compareStatementEffect(source, target)).toBe(false);
    });
    it('returns true when the source and target effects match.', () => {
      const source = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Action": "*",
          "Effect": "Allow",
          "Resource": "*"
        }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Effect": "Allow",
          "Action": "*",
          "Resource": "*"
        }
      `)
      );
      expect(IamHelper.compareStatementEffect(source, target)).toBe(true);
    });
  });

  describe('compareStatementAction', () => {
    it('returns false when the source and target actions do not match.', () => {
      const source = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Action": "s3:GetObject",
          "Effect": "Allow",
          "Resource": "*"
        }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Effect": "Allow",
          "Action": "s3:PutObject",
          "Resource": "*"
        }
      `)
      );
      expect(IamHelper.compareStatementAction(source, target)).toBe(false);
    });

    it('returns false when the source has more actions than the target.', () => {
      const source = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Action": ["s3:GetObject", "s3:PutObject"],
          "Effect": "Allow",
          "Resource": "*"
        }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Effect": "Allow",
          "Action": "s3:PutObject",
          "Resource": "*"
        }
      `)
      );
      expect(IamHelper.compareStatementAction(source, target)).toBe(false);
    });

    it('returns true when the source and target match.', () => {
      const source = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Action": ["s3:GetObject", "s3:PutObject"],
          "Effect": "Allow",
          "Resource": "*"
        }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Effect": "Allow",
          "Action": ["s3:GetObject", "s3:PutObject"],
          "Resource": "*"
        }
      `)
      );
      expect(IamHelper.compareStatementAction(source, target)).toBe(true);
    });
  });

  describe('containsStatementId', () => {
    it('returns false when the source and target SIDs do not match.', () => {
      const source = PolicyDocument.fromJson({
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'StatementToCheck',
            Principal: {
              AWS: '*'
            },
            Action: '*',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      });
      const targetSid = 'StatementDifferentThanExpected';
      expect(IamHelper.containsStatementId(source, targetSid)).toBeFalsy();
    });

    it('returns true when the a statement SID in source doc and target SID match.', () => {
      const source = PolicyDocument.fromJson({
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'StatementToCheck',
            Principal: {
              AWS: '*'
            },
            Action: '*',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      });
      const targetSid = 'StatementToCheck';
      expect(IamHelper.containsStatementId(source, targetSid)).toBeTruthy();
    });

    it('returns false when statements do not exist in source doc', () => {
      const source = new PolicyDocument();
      const targetSid = 'StatementToCheck';
      expect(IamHelper.containsStatementId(source, targetSid)).toBeFalsy();
    });
  });

  describe('addPrincipalToStatement', () => {
    it('returns empty doc if source doc is empty', () => {
      const source = new PolicyDocument();
      const targetSid = 'StatementToCheck';
      const newPrincipal = `arn:aws:iam::newAccountId:root`;
      try {
        IamHelper.addPrincipalToStatement(source, targetSid, newPrincipal);
      } catch (err) {
        expect(err.message).toBe('Cannot add principal. Policy document is invalid');
      }
    });

    it('adds principal in new array before returning policy doc', () => {
      const source = new PolicyDocument();
      const existingStatement = PolicyStatement.fromJson({
        Sid: 'StatementToCheck',
        Principal: {
          AWS: 'arn:aws:iam::oldAccountId:root'
        },
        Action: '*',
        Effect: 'Allow',
        Resource: ['arn:aws:s3:::someBucket', 'arn:aws:s3:::someBucket/*']
      });

      const expected = new PolicyDocument();
      const updatedStatement = PolicyStatement.fromJson({
        Sid: 'StatementToCheck',
        Principal: {
          AWS: ['arn:aws:iam::oldAccountId:root', 'arn:aws:iam::newAccountId:root']
        },
        Action: '*',
        Effect: 'Allow',
        Resource: ['arn:aws:s3:::someBucket', 'arn:aws:s3:::someBucket/*']
      });
      source.addStatements(existingStatement);
      expected.addStatements(updatedStatement);
      const targetSid = 'StatementToCheck';
      const newPrincipal = 'arn:aws:iam::newAccountId:root';
      const response = IamHelper.addPrincipalToStatement(source, targetSid, newPrincipal);

      expect(response.toJSON()).toStrictEqual(expected.toJSON());
    });

    it('adds principal in existing array before returning policy doc', () => {
      const source = new PolicyDocument();
      const existingStatement = PolicyStatement.fromJson({
        Sid: 'StatementToCheck',
        Principal: {
          AWS: ['arn:aws:iam::oldAccountId:root', 'arn:aws:iam::oldAccountId2:root']
        },
        Action: '*',
        Effect: 'Allow',
        Resource: ['arn:aws:s3:::someBucket', 'arn:aws:s3:::someBucket/*']
      });

      const expected = new PolicyDocument();
      const updatedStatement = PolicyStatement.fromJson({
        Sid: 'StatementToCheck',
        Principal: {
          AWS: [
            'arn:aws:iam::oldAccountId:root',
            'arn:aws:iam::oldAccountId2:root',
            'arn:aws:iam::newAccountId:root'
          ]
        },
        Action: '*',
        Effect: 'Allow',
        Resource: ['arn:aws:s3:::someBucket', 'arn:aws:s3:::someBucket/*']
      });
      source.addStatements(existingStatement);
      expected.addStatements(updatedStatement);
      const targetSid = 'StatementToCheck';
      const newPrincipal = 'arn:aws:iam::newAccountId:root';
      const response = IamHelper.addPrincipalToStatement(source, targetSid, newPrincipal);

      expect(response.toJSON()).toStrictEqual(expected.toJSON());
    });
  });

  describe('removePrincipalFromStatement', () => {
    it('returns empty doc if source doc is empty', () => {
      const source = new PolicyDocument();
      const targetSid = 'StatementToCheck';
      const newPrincipal = `arn:aws:iam::newAccountId:root`;
      try {
        IamHelper.removePrincipalFromStatement(source, targetSid, newPrincipal);
      } catch (err) {
        expect(err.message).toBe('Cannot remove principal. Policy document is invalid');
      }
    });

    it('removes principal from new array before returning policy doc', () => {
      const source = new PolicyDocument();
      const existingStatement = PolicyStatement.fromJson({
        Sid: 'StatementToCheck',
        Principal: {
          AWS: ['arn:aws:iam::oldAccountId:root', 'arn:aws:iam::newAccountId:root']
        },
        Action: '*',
        Effect: 'Allow',
        Resource: ['arn:aws:s3:::someBucket', 'arn:aws:s3:::someBucket/*']
      });

      const expected = new PolicyDocument();
      const updatedStatement = PolicyStatement.fromJson({
        Sid: 'StatementToCheck',
        Principal: {
          AWS: ['arn:aws:iam::oldAccountId:root']
        },
        Action: '*',
        Effect: 'Allow',
        Resource: ['arn:aws:s3:::someBucket', 'arn:aws:s3:::someBucket/*']
      });
      source.addStatements(existingStatement);
      expected.addStatements(updatedStatement);
      const targetSid = 'StatementToCheck';
      const principalToRemove = 'arn:aws:iam::newAccountId:root';
      const response = IamHelper.removePrincipalFromStatement(source, targetSid, principalToRemove);

      expect(response.toJSON()).toStrictEqual(expected.toJSON());
    });

    it('removes nothing if principal does not exist on policy doc', () => {
      const source = new PolicyDocument();
      const existingStatement = PolicyStatement.fromJson({
        Sid: 'StatementToCheck',
        Principal: {
          AWS: ['arn:aws:iam::oldAccountId:root', 'arn:aws:iam::otherAccountId:root']
        },
        Action: '*',
        Effect: 'Allow',
        Resource: ['arn:aws:s3:::someBucket', 'arn:aws:s3:::someBucket/*']
      });

      const expected = new PolicyDocument();
      const updatedStatement = PolicyStatement.fromJson({
        Sid: 'StatementToCheck',
        Principal: {
          AWS: ['arn:aws:iam::oldAccountId:root', 'arn:aws:iam::otherAccountId:root']
        },
        Action: '*',
        Effect: 'Allow',
        Resource: ['arn:aws:s3:::someBucket', 'arn:aws:s3:::someBucket/*']
      });
      source.addStatements(existingStatement);
      expected.addStatements(updatedStatement);
      const targetSid = 'StatementToCheck';
      const principalToRemove = 'arn:aws:iam::newAccountId:root';
      const response = IamHelper.removePrincipalFromStatement(source, targetSid, principalToRemove);

      expect(response.toJSON()).toStrictEqual(expected.toJSON());
    });

    it('removes principal from existing array before returning policy doc', () => {
      const source = new PolicyDocument();
      const existingStatement = PolicyStatement.fromJson({
        Sid: 'StatementToCheck',
        Principal: {
          AWS: [
            'arn:aws:iam::oldAccountId:root',
            'arn:aws:iam::oldAccountId2:root',
            'arn:aws:iam::newAccountId:root'
          ]
        },
        Action: '*',
        Effect: 'Allow',
        Resource: ['arn:aws:s3:::someBucket', 'arn:aws:s3:::someBucket/*']
      });

      const expected = new PolicyDocument();
      const updatedStatement = PolicyStatement.fromJson({
        Sid: 'StatementToCheck',
        Principal: {
          AWS: ['arn:aws:iam::oldAccountId:root', 'arn:aws:iam::oldAccountId2:root']
        },
        Action: '*',
        Effect: 'Allow',
        Resource: ['arn:aws:s3:::someBucket', 'arn:aws:s3:::someBucket/*']
      });
      source.addStatements(existingStatement);
      expected.addStatements(updatedStatement);
      const targetSid = 'StatementToCheck';
      const principalToRemove = 'arn:aws:iam::newAccountId:root';
      const response = IamHelper.removePrincipalFromStatement(source, targetSid, principalToRemove);

      expect(response.toJSON()).toStrictEqual(expected.toJSON());
    });

    it('removes principal from existing array before returning policy doc', () => {
      const source = new PolicyDocument();
      const existingStatement = PolicyStatement.fromJson({
        Sid: 'StatementToCheck',
        Principal: {
          AWS: 'arn:aws:iam::newAccountId:root'
        },
        Action: '*',
        Effect: 'Allow',
        Resource: ['arn:aws:s3:::someBucket', 'arn:aws:s3:::someBucket/*']
      });

      source.addStatements(existingStatement);
      const targetSid = 'StatementToCheck';
      const principalToRemove = 'arn:aws:iam::newAccountId:root';
      try {
        IamHelper.removePrincipalFromStatement(source, targetSid, principalToRemove);
      } catch (err) {
        expect(err.message).toStrictEqual('Cannot remove principal since only one principal is assigned');
      }
    });
  });

  describe('compareStatementResource', () => {
    it('returns false when the source and target resources do not match.', () => {
      const source = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Action": "*",
          "Effect": "Allow",
          "Resource": "*"
        }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Effect": "Allow",
          "Action": "*",
          "Resource": "arn:aws:s3:::someBucket"
        }
      `)
      );
      expect(IamHelper.compareStatementResource(source, target)).toBe(false);
    });

    it('returns false when the source has more actions than the target.', () => {
      const source = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Action": "*",
          "Effect": "Allow",
          "Resource": ["arn:aws:s3:::someBucket", "arn:aws:s3:::someBucket/*"]
        }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Effect": "Allow",
          "Action": "*",
          "Resource": "*"
        }
      `)
      );
      expect(IamHelper.compareStatementResource(source, target)).toBe(false);
    });

    it('returns true when the source and target match.', () => {
      const source = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Action": "*",
          "Effect": "Allow",
          "Resource": "*"
        }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Effect": "Allow",
          "Action": "*",
          "Resource": "*"
        }
      `)
      );
      expect(IamHelper.compareStatementResource(source, target)).toBe(true);
    });
  });

  describe('compareStatementCondition', () => {
    it('returns false when one statement has a condition and the other does not', () => {
      const source = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Action": "*",
          "Effect": "Allow",
          "Resource": "*",
          "Condition": {
            "StringEquals": {
              "s3:DataAccessPointAccount": "123456789012"
            }
          }
        }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Effect": "Allow",
          "Action": "*",
          "Resource": "*"
        }
      `)
      );
      expect(IamHelper.compareStatementCondition(source, target)).toBe(false);
    });

    it('returns false when the source key does not match the target key', () => {
      const source = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Action": "*",
          "Effect": "Allow",
          "Resource": "*",
          "Condition": {
            "StringEquals": {
              "s3:DataAccessPointAccount": "123456789012"
            }
          }
        }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Effect": "Allow",
          "Action": "*",
          "Resource": "*",
          "Condition": {
            "StringNotEquals": {
              "s3:DataAccessPointAccount": "123456789012"
            }
          }
        }
      `)
      );
      expect(IamHelper.compareStatementCondition(source, target)).toBe(false);
    });

    it('returns false when the source value does not match the target value', () => {
      const source = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Action": "*",
          "Effect": "Allow",
          "Resource": "*",
          "Condition": {
            "StringEquals": {
              "s3:DataAccessPointAccount": "000000000000"
            }
          }
        }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Effect": "Allow",
          "Action": "*",
          "Resource": "*",
          "Condition": {
            "StringEquals": {
              "s3:DataAccessPointAccount": "123456789012"
            }
          }
        }
      `)
      );
      expect(IamHelper.compareStatementCondition(source, target)).toBe(false);
    });

    it('returns true when the conditions match', () => {
      const source = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Action": "*",
          "Effect": "Allow",
          "Resource": "*",
          "Condition": {
            "StringEquals": {
              "s3:DataAccessPointAccount": "123456789012"
            }
          }
        }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Effect": "Allow",
          "Action": "*",
          "Resource": "*",
          "Condition": {
            "StringEquals": {
              "s3:DataAccessPointAccount": "123456789012"
            }
          }
        }
      `)
      );
      expect(IamHelper.compareStatementCondition(source, target)).toBe(true);
    });
  });

  describe('policyDocumentContainsStatement', () => {
    it('returns false when the principals do not match', () => {
      const source = PolicyDocument.fromJson(
        JSON.parse(`
      {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Principal": {
              "AWS": "*"
            },
            "Action": "*",
            "Effect": "Allow",
            "Resource": "*",
            "Condition": {
              "StringEquals": {
                "s3:DataAccessPointAccount": "123456789012"
              }
            }
          }
        ]
      }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "arn:aws:iam::123456789012:role/someRole"
          },
          "Effect": "Allow",
          "Action": "*",
          "Resource": "*",
          "Condition": {
            "StringEquals": {
              "s3:DataAccessPointAccount": "123456789012"
            }
          }
        }
      `)
      );
      expect(IamHelper.policyDocumentContainsStatement(source, target)).toBeFalsy();
    });

    it('returns false when the effects do not match', () => {
      const source = PolicyDocument.fromJson(
        JSON.parse(`
      {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Principal": {
              "AWS": "*"
            },
            "Action": "*",
            "Effect": "Allow",
            "Resource": "*",
            "Condition": {
              "StringEquals": {
                "s3:DataAccessPointAccount": "123456789012"
              }
            }
          }
        ]
      }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Effect": "Deny",
          "Action": "*",
          "Resource": "*",
          "Condition": {
            "StringEquals": {
              "s3:DataAccessPointAccount": "123456789012"
            }
          }
        }
      `)
      );
      expect(IamHelper.policyDocumentContainsStatement(source, target)).toBeFalsy();
    });

    it('returns false when the actions do not match', () => {
      const source = PolicyDocument.fromJson(
        JSON.parse(`
      {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Principal": {
              "AWS": "*"
            },
            "Action": "*",
            "Effect": "Allow",
            "Resource": "*",
            "Condition": {
              "StringEquals": {
                "s3:DataAccessPointAccount": "123456789012"
              }
            }
          }
        ]
      }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Effect": "Allow",
          "Action": "s3:PutObject",
          "Resource": "*",
          "Condition": {
            "StringEquals": {
              "s3:DataAccessPointAccount": "123456789012"
            }
          }
        }
      `)
      );
      expect(IamHelper.policyDocumentContainsStatement(source, target)).toBeFalsy();
    });

    it('returns false when the resources do not match', () => {
      const source = PolicyDocument.fromJson(
        JSON.parse(`
      {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Principal": {
              "AWS": "*"
            },
            "Action": "*",
            "Effect": "Allow",
            "Resource": "*",
            "Condition": {
              "StringEquals": {
                "s3:DataAccessPointAccount": "123456789012"
              }
            }
          }
        ]
      }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Effect": "Allow",
          "Action": "*",
          "Resource": "arn:aws:s3:::someBucket",
          "Condition": {
            "StringEquals": {
              "s3:DataAccessPointAccount": "123456789012"
            }
          }
        }
      `)
      );
      expect(IamHelper.policyDocumentContainsStatement(source, target)).toBeFalsy();
    });

    it('returns false when the conditions do not match', () => {
      const source = PolicyDocument.fromJson(
        JSON.parse(`
      {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Principal": {
              "AWS": "*"
            },
            "Action": "*",
            "Effect": "Allow",
            "Resource": "*",
            "Condition": {
              "StringEquals": {
                "s3:DataAccessPointAccount": "123456789012"
              }
            }
          }
        ]
      }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Effect": "Allow",
          "Action": "*",
          "Resource": "*",
          "Condition": {
            "StringNotEquals": {
              "s3:DataAccessPointAccount": "123456789012"
            }
          }
        }
      `)
      );
      expect(IamHelper.policyDocumentContainsStatement(source, target)).toBeFalsy();
    });

    it('returns true when the document includes the statement.', () => {
      const source = PolicyDocument.fromJson(
        JSON.parse(`
      {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Principal": {
              "AWS": "*"
            },
            "Action": "*",
            "Effect": "Allow",
            "Resource": "*",
            "Condition": {
              "StringEquals": {
                "s3:DataAccessPointAccount": "123456789012"
              }
            }
          }
        ]
      }
      `)
      );
      const target = PolicyStatement.fromJson(
        JSON.parse(`
        {
          "Principal": {
            "AWS": "*"
          },
          "Effect": "Allow",
          "Action": "*",
          "Resource": "*",
          "Condition": {
            "StringEquals": {
              "s3:DataAccessPointAccount": "123456789012"
            }
          }
        }
      `)
      );
      expect(IamHelper.policyDocumentContainsStatement(source, target)).toBe(true);
    });
  });
});
