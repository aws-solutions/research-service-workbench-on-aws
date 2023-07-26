/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export enum Language {
  en = 'en',
  es = 'es',
  pt = 'pt'
}

export interface AppSettings {
  language: Language;
  logo: string;
  favicon: string;
  name: string;
  slogan?: string;
  description?: string;
}

export const defaultAppSettings: AppSettings = {
  language: Language.en,
  logo: 'logo.svg',
  favicon: 'favicon.svg',
  name: 'Performance Dashboard on AWS',
  slogan: 'Fast and reliable delivery of your metrics',
  description:
    'The Performance Dashboard makes data open and accessible to provide transparency and helps drive the ongoing improvement of digital services.'
};
