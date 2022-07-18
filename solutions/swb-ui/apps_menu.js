const fs = require('fs');
const path = require('path');

module.exports = {
  get: (pagePath) => {
    return fs.readdirSync(pagePath).map((file) => {
      return path.parse(file).name;
    });
  }
};
