module.exports = {
  branches: 'main',
  repositoryUrl: 'https://github.com/awslabs/solution-spark-on-aws',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/github'
  ]
};
