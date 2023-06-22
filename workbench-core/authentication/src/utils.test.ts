/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { getTimeInMS, TimeUnits } from '.';

describe('util tests', () => {
  describe('getTimeInMS tests', () => {
    it('should return length converted to ms if units is TimeUnits.DAYS', () => {
      const time = getTimeInMS(1, TimeUnits.DAYS);

      expect(time).toBe(86400000);
    });

    it('should return 0 when length is 0 and units is TimeUnits.DAYS', () => {
      const time = getTimeInMS(0, TimeUnits.DAYS);

      expect(time).toBe(0);
    });

    it('should return length converted to ms if units is TimeUnits.HOURS', () => {
      const time = getTimeInMS(1, TimeUnits.HOURS);

      expect(time).toBe(3600000);
    });

    it('should return 0 when length is 0 and units is TimeUnits.HOURS', () => {
      const time = getTimeInMS(0, TimeUnits.HOURS);

      expect(time).toBe(0);
    });

    it('should return length converted to ms if units is TimeUnits.MINUTES', () => {
      const time = getTimeInMS(1, TimeUnits.MINUTES);

      expect(time).toBe(60000);
    });

    it('should return 0 when length is 0 and units is TimeUnits.MINUTES', () => {
      const time = getTimeInMS(0, TimeUnits.MINUTES);

      expect(time).toBe(0);
    });

    it('should return length converted to ms if units is TimeUnits.SECONDS', () => {
      const time = getTimeInMS(1, TimeUnits.SECONDS);

      expect(time).toBe(1000);
    });

    it('should return 0 when length is 0 and units is TimeUnits.SECONDS', () => {
      const time = getTimeInMS(0, TimeUnits.SECONDS);

      expect(time).toBe(0);
    });
  });
});
