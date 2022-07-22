import Button from '@awsui/components-react/button';
import { useAuthentication } from '../context/AuthenticationContext';
import styles from '../styles/Hero.module.scss';

function Login(): JSX.Element {
  const { signIn } = useAuthentication();

  return (
    <Button className={styles.primaryButton} variant="primary" onClick={async () => await signIn()}>
      Login
    </Button>
  );
}

export default Login;
