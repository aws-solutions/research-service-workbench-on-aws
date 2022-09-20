export interface CypressConfig {
  ADMIN_USER: string;
  ADMIN_PASSWORD: string;
  BASE_URL: string;
  COGNITO_DOMAIN_NAME: string;
  ENVIRONMENT_TYPES: EnvTypeConfig[];
  ENVIRONMENT_PROJECT: string;
  ENVIRONMENT_STUDIES: string[];
  CLEAN_UP_ENVIRONMENTS: boolean;
}

export interface EnvTypeConfig {
  EnvironmentType: string;
  EnvironmentTypeConfig: string;
}

export interface CreateEnvironmentForm {
  Name: string;
  EnvironmentType: string;
  EnvironmentTypeConfig: string;
  Project: string;
  Studies: string[];
}
