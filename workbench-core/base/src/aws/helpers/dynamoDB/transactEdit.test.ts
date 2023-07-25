/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import TransactEdit from './transactEdit';

describe('transactEdit', () => {
  test('addPutItems', async () => {
    const transactEdit = new TransactEdit({ region: 'us-east-2' }, 'swb-dev-oh');
    //BUILD
    const etc = {
      pk: {
        S: 'ENV#82c56cf2-75b7-43ce-884a-aee45f91866b'
      },
      sk: {
        S: 'ETC#envTypeConfig-123'
      },
      id: {
        S: 'envTypeConfig-123'
      },
      productId: {
        S: 'prod-t5q2vqlgvd76o'
      },
      provisioningArtifactId: {
        S: 'pa-3cwcuxmksf2xy'
      }
    };

    const proj = {
      pk: {
        S: 'ENV#82c56cf2-75b7-43ce-884a-aee45f91866b'
      },
      sk: {
        S: 'PROJ#proj-123'
      },
      id: {
        S: 'proj-123'
      },
      name: {
        S: 'Example project'
      }
    };
    // OPERATE
    transactEdit.addPutItems([etc, proj]);

    // CHECK
    const response = transactEdit.getParams();

    // Example iso date string 2022-05-16T21:29:23.461Z
    const isoStringRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
    const expectedResponse = {
      TransactItems: [
        {
          Put: {
            TableName: 'swb-dev-oh',
            Item: {
              pk: { S: 'ENV#82c56cf2-75b7-43ce-884a-aee45f91866b' },
              sk: { S: 'ETC#envTypeConfig-123' },
              id: { S: 'envTypeConfig-123' },
              productId: { S: 'prod-t5q2vqlgvd76o' },
              provisioningArtifactId: { S: 'pa-3cwcuxmksf2xy' },
              updatedAt: { S: expect.stringMatching(isoStringRegex) },
              createdAt: { S: expect.stringMatching(isoStringRegex) }
            }
          }
        },
        {
          Put: {
            TableName: 'swb-dev-oh',
            Item: {
              pk: { S: 'ENV#82c56cf2-75b7-43ce-884a-aee45f91866b' },
              sk: { S: 'PROJ#proj-123' },
              id: { S: 'proj-123' },
              name: { S: 'Example project' },
              updatedAt: { S: expect.stringMatching(isoStringRegex) },
              createdAt: { S: expect.stringMatching(isoStringRegex) }
            }
          }
        }
      ]
    };
    expect(response).toStrictEqual(expectedResponse);
  });

  test('addPutRequests', async () => {
    const transactEdit = new TransactEdit({ region: 'us-east-2' }, 'swb-dev-oh');
    //BUILD
    const etc = {
      pk: {
        S: 'ENV#82c56cf2-75b7-43ce-884a-aee45f91866b'
      },
      sk: {
        S: 'ETC#envTypeConfig-123'
      },
      id: {
        S: 'envTypeConfig-123'
      },
      productId: {
        S: 'prod-t5q2vqlgvd76o'
      },
      provisioningArtifactId: {
        S: 'pa-3cwcuxmksf2xy'
      }
    };

    const proj = {
      pk: {
        S: 'ENV#82c56cf2-75b7-43ce-884a-aee45f91866b'
      },
      sk: {
        S: 'PROJ#proj-123'
      },
      id: {
        S: 'proj-123'
      },
      name: {
        S: 'Example project'
      }
    };

    const putRequestsParams = [
      {
        item: etc,
        conditionExpression: 'attribute_not_exists(pk)'
      },

      {
        item: proj,
        conditionExpression: 'attribute_not_exists(pk)'
      }
    ];

    // OPERATE
    transactEdit.addPutRequests(putRequestsParams);

    // CHECK
    const response = transactEdit.getParams();

    const expectedResponse = {
      TransactItems: [
        {
          Put: {
            TableName: 'swb-dev-oh',
            Item: {
              pk: { S: 'ENV#82c56cf2-75b7-43ce-884a-aee45f91866b' },
              sk: { S: 'ETC#envTypeConfig-123' },
              id: { S: 'envTypeConfig-123' },
              productId: { S: 'prod-t5q2vqlgvd76o' },
              provisioningArtifactId: { S: 'pa-3cwcuxmksf2xy' }
            },
            ConditionExpression: 'attribute_not_exists(pk)'
          }
        },
        {
          Put: {
            TableName: 'swb-dev-oh',
            Item: {
              pk: { S: 'ENV#82c56cf2-75b7-43ce-884a-aee45f91866b' },
              sk: { S: 'PROJ#proj-123' },
              id: { S: 'proj-123' },
              name: { S: 'Example project' }
            },
            ConditionExpression: 'attribute_not_exists(pk)'
          }
        }
      ]
    };
    expect(response).toStrictEqual(expectedResponse);
  });

  test('addDeleteRequest', async () => {
    const transactEdit = new TransactEdit({ region: 'us-east-2' }, 'swb-dev-oh');
    //BUILD
    const etc = {
      pk: {
        S: 'ENV#82c56cf2-75b7-43ce-884a-aee45f91866b'
      },
      sk: {
        S: 'ETC#envTypeConfig-123'
      }
    };
    const proj = {
      pk: {
        S: 'ENV#82c56cf2-75b7-43ce-884a-aee45f91866b'
      },
      sk: {
        S: 'PROJ#proj-123'
      }
    };
    // OPERATE
    transactEdit.addDeleteRequests([etc, proj]);
    // CHECK
    const response = transactEdit.getParams();

    const expectedResponse = {
      TransactItems: [
        {
          Delete: {
            TableName: 'swb-dev-oh',
            Key: {
              pk: { S: 'ENV#82c56cf2-75b7-43ce-884a-aee45f91866b' },
              sk: { S: 'ETC#envTypeConfig-123' }
            }
          }
        },
        {
          Delete: {
            TableName: 'swb-dev-oh',
            Key: {
              pk: { S: 'ENV#82c56cf2-75b7-43ce-884a-aee45f91866b' },
              sk: { S: 'PROJ#proj-123' }
            }
          }
        }
      ]
    };
    expect(response).toStrictEqual(expectedResponse);
  });
});
