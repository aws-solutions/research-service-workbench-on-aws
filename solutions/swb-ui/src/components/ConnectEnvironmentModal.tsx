import { Modal, SpaceBetween, Link } from '@awsui/components-react';
import Box from '@awsui/components-react/box';
import Button from '@awsui/components-react/button';

interface ConnectEnvironmentModalProps {
  closeModal: () => void;
  instructions: string;
  authCredResponse: { [key: string]: string };
}

export default function ConnectEnvironmentModal(props: ConnectEnvironmentModalProps): JSX.Element {
  function getConnectionDetails(): JSX.Element {
    if (props.authCredResponse.url) {
      return (
        <Link href={props.authCredResponse.url} target="_blank">
          Click to connect
        </Link>
      );
    }
    return <></>;
  }
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
            <Box variant="div">{props.instructions}</Box>
          </SpaceBetween>
        </Box>
        <Box>
          <SpaceBetween direction="vertical" size="xxs">
            <Box variant="div" fontWeight="bold">
              Connection Details
            </Box>{' '}
            <Box variant="div">{getConnectionDetails()}</Box>
          </SpaceBetween>
        </Box>
      </SpaceBetween>
    </Modal>
  );
}
