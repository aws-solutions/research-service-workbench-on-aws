module.exports = {
  branches: 'main',
  repositoryUrl: 'https://github.com/aws-solutions/research-service-workbench-on-aws',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/github'
  ]
};
