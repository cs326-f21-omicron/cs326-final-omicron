import fs from 'fs';
const JSONfile = './data.json';

const readFile = () => {
  if (fs.existsSync(JSONfile)) {
    return JSON.parse(fs.readFileSync(JSONfile));
  } else {
    return {};
  }
};

const checkEmail = (email) => {
  const data = readFile();
  for (let i = 0; i < data.length; i += 1) {
    if (data[i].email === email) {
      return true;
    }
  }
  return false;
};

export const findUser = (email, password) => {
  const data = readFile();
  for (let i = 0; i < data.length; i += 1) {
    if (data[i].email === email && data[i].password === password) {
      return data[i];
    }
  }
  return null;
};

export const addUser = (email, password) => {
  const data = readFile();
  if (checkEmail(email)) {
    return false;
  }
  data.push({ email, password });
  fs.writeFileSync(JSONfile, JSON.stringify(data));
  return true;
};
