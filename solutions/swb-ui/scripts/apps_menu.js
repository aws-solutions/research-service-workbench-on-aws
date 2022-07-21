const fs = require('fs');
const path = require('path');

module.exports = {
  get: (pagePath) => fs.readdirSync(pagePath).map((file) => path.parse(file).name)
};
