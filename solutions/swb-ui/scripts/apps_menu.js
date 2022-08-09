const fs = require('fs');
const path = require('path');

module.exports = {
  get: (pagePath) =>
    fs
      .readdirSync(pagePath)
      .map((file) => {
        if (path.extname(file).toLowerCase() === '.tsx') {
          return path.parse(file).name;
        }
      })
      .filter((file) => {
        // Filer out `null` files
        return file;
      })
};
