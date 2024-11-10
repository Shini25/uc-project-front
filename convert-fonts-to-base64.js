const fs = require('fs');
const path = require('path');

const fonts = ['Roboto-Medium.ttf', 'Roboto-Regular.ttf'];
fonts.forEach(font => {
  const filePath = path.join(__dirname, font);
  const fileContent = fs.readFileSync(filePath);
  const base64Content = fileContent.toString('base64');
  console.log(`'${font}': '${base64Content}'`);
});