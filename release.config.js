module.exports = {
  branches: 'main',
  repositoryUrl: 'https://github.com/awslabs/monorepo-for-service-workbench',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/github'
  ]
};
