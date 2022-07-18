import { EnvironmentConnectionLinkPlaceholder } from '@amzn/environments';
import { Modal, SpaceBetween, Link } from '@awsui/components-react';
import Box from '@awsui/components-react/box';
import Button from '@awsui/components-react/button';

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

  const getPlaceholderUIElement = (placeholder: { [key: string]: string }): JSX.Element => {
    if (placeholder.type && placeholder.type === 'link') {
      return getLink(placeholder as unknown as EnvironmentConnectionLinkPlaceholder);
    }
    console.error('Could not find UI Element for placeholder', placeholder);
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
    const sections = instructions.split(firstPlaceholder);

    return (
      <Box variant="span">
        {sections[0]}
        {getPlaceholderUIElement(JSON.parse(firstPlaceholder.replaceAll('#{', '{').replaceAll('\\"', '"')))}
        {parseConnectionInstruction(sections[1])}
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
