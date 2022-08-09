/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { getTimeInSeconds, TimeUnits } from '.';

describe('util tests', () => {
  describe('getTimeInSeconds tests', () => {
    it('should return length converted to seconds if units is TimeUnits.DAYS', () => {
      const time = getTimeInSeconds(1, TimeUnits.DAYS);

      expect(time).toBe(86400);
    });

    it('should return 0 when length is 0 and units is TimeUnits.DAYS', () => {
      const time = getTimeInSeconds(0, TimeUnits.DAYS);

      expect(time).toBe(0);
    });

    it('should return length converted to seconds if units is TimeUnits.HOURS', () => {
      const time = getTimeInSeconds(1, TimeUnits.HOURS);

      expect(time).toBe(3600);
    });

    it('should return 0 when length is 0 and units is TimeUnits.HOURS', () => {
      const time = getTimeInSeconds(0, TimeUnits.HOURS);

      expect(time).toBe(0);
    });

    it('should return length converted to seconds if units is TimeUnits.MINUTES', () => {
      const time = getTimeInSeconds(1, TimeUnits.MINUTES);

      expect(time).toBe(60);
    });

    it('should return 0 when length is 0 and units is TimeUnits.MINUTES', () => {
      const time = getTimeInSeconds(0, TimeUnits.MINUTES);

      expect(time).toBe(0);
    });

    it('should return length converted to seconds if units is TimeUnits.SECONDS', () => {
      const time = getTimeInSeconds(1, TimeUnits.SECONDS);

      expect(time).toBe(1);
    });

    it('should return 0 when length is 0 and units is TimeUnits.SECONDS', () => {
      const time = getTimeInSeconds(0, TimeUnits.SECONDS);

      expect(time).toBe(0);
    });
  });
});
