import fs from 'fs';
const JSONfile = './data.json';

const readFile = () => {
  if (fs.existsSync(JSONfile)) {
    return JSON.parse(fs.readFileSync(JSONfile));
  } else {
    return {};
  }
};

export const getData = () => {
  const data = readFile();
  return data;
};
