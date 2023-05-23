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
  logo: '/logo-image.png',
  favicon: '/favicon.ico',
  name: 'Research Service Workbench',
  slogan: '',
  description: ''
};
