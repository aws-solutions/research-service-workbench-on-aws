/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { EnvironmentConnectionLinkPlaceholder } from '@aws/workbench-core-environments';
import { useNotifications } from '@aws/workbench-core-swb-common-ui';
import { Modal, SpaceBetween, Link, Box, Button } from '@cloudscape-design/components';
import React from 'react';

interface EnvironmentConnectModalProps {
  closeModal: () => void;
  instructions: string;
  authCredResponse: { [key: string]: string };
}

export default function EnvironmentConnectModal(props: EnvironmentConnectModalProps): JSX.Element {
  const getLink = (linkDetail: EnvironmentConnectionLinkPlaceholder): JSX.Element => {
    return (
      <Link href={props.authCredResponse[linkDetail.hrefKey]} target="_blank">
        {linkDetail.text}
      </Link>
    );
  };

  const { displayNotification, closeNotification } = useNotifications();

  const getPlaceholderUIElement = (placeholder: { [key: string]: string }): JSX.Element => {
    if (placeholder.type && placeholder.type === 'link') {
      return getLink(placeholder as unknown as EnvironmentConnectionLinkPlaceholder);
    }
    console.error('Could not find UI Element for placeholder', placeholder);
    const id = 'EnvironmentConnectModalError';
    displayNotification(id, {
      type: 'error',
      dismissible: true,
      dismissLabel: 'Dismiss message',
      onDismiss: () => closeNotification(id),
      content: 'Failed to get connection information'
    });
    return <></>;
  };

  const parseConnectionInstruction = (instructions: string): JSX.Element => {
    // Check if there are any placeHolder in the instructions. If there isn't return the instruction as is
    const placeholderMatches = instructions.match(/(\#{.*?})/g);
    if (!placeholderMatches) {
      return <>{instructions}</>;
    }
    const firstPlaceholder = placeholderMatches[0];
    // Separate instructions into 2 sections, with a gap in the middle for the placeholderUIElement
    const beforePlaceholder = instructions.slice(0, instructions.indexOf(firstPlaceholder));
    const afterPlaceholder = instructions.slice(
      instructions.indexOf(firstPlaceholder) + firstPlaceholder.length
    );

    return (
      <Box variant="span">
        {beforePlaceholder}
        {getPlaceholderUIElement(JSON.parse(firstPlaceholder.replaceAll('#{', '{').replaceAll('\\"', '"')))}
        {parseConnectionInstruction(afterPlaceholder)}
      </Box>
    );
  };

  return (
    <Modal
      visible
      closeAriaLabel="Close"
      onDismiss={() => {
        props.closeModal();
      }}
      header="Connect to Workspace"
      footer={
        <Box float="right">
          <Button
            data-testid="environmentConnectClose"
            variant="primary"
            onClick={() => {
              props.closeModal();
            }}
          >
            Close
          </Button>
        </Box>
      }
    >
      <SpaceBetween direction="vertical" size="xs">
        <Box>
          <SpaceBetween direction="vertical" size="xxs">
            <Box variant="div" fontWeight="bold">
              Instructions
            </Box>{' '}
            {parseConnectionInstruction(props.instructions)}
          </SpaceBetween>
        </Box>
      </SpaceBetween>
    </Modal>
  );
}
