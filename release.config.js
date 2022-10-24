module.exports = {
  branches: 'main',
  repositoryUrl: 'https://github.com/aws-solutions/solution-spark-on-aws',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/github'
  ]
};
