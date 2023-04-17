/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from 'react-dom';
import App from './App';

import { BrowserRouter } from 'react-router-dom';

window.addEventListener('DOMContentLoaded', () => {
  const domNode = document.getElementById('root');
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
    domNode
  );
});
