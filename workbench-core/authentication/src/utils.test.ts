/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { TimeUnitsType } from '@aws-sdk/client-cognito-identity-provider';
import { getTimeInSeconds } from '.';

describe('util tests', () => {
  describe('getTimeInSeconds tests', () => {
    it('should return length converted to seconds if units is TimeUnitsType.DAYS', () => {
      const time = getTimeInSeconds(1, TimeUnitsType.DAYS);

      expect(time).toBe(86400);
    });

    it('should return 0 when length is 0 and units is TimeUnitsType.DAYS', () => {
      const time = getTimeInSeconds(0, TimeUnitsType.DAYS);

      expect(time).toBe(0);
    });

    it('should return length converted to seconds if units is TimeUnitsType.HOURS', () => {
      const time = getTimeInSeconds(1, TimeUnitsType.HOURS);

      expect(time).toBe(3600);
    });

    it('should return 0 when length is 0 and units is TimeUnitsType.HOURS', () => {
      const time = getTimeInSeconds(0, TimeUnitsType.HOURS);

      expect(time).toBe(0);
    });

    it('should return length converted to seconds if units is TimeUnitsType.MINUTES', () => {
      const time = getTimeInSeconds(1, TimeUnitsType.MINUTES);

      expect(time).toBe(60);
    });

    it('should return 0 when length is 0 and units is TimeUnitsType.MINUTES', () => {
      const time = getTimeInSeconds(0, TimeUnitsType.MINUTES);

      expect(time).toBe(0);
    });

    it('should return length converted to seconds if units is TimeUnitsType.SECONDS', () => {
      const time = getTimeInSeconds(1, TimeUnitsType.SECONDS);

      expect(time).toBe(1);
    });

    it('should return 0 when length is 0 and units is TimeUnitsType.SECONDS', () => {
      const time = getTimeInSeconds(0, TimeUnitsType.SECONDS);

      expect(time).toBe(0);
    });
  });
});
