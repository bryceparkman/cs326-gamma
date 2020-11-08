
const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile('index.html');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.get('/loginProfile', (req, res) => {
  return res.send(req.body.email);
});
 

app.post('/userProfile', (req, res) => {
  const profile = {
    firstName: req.body.fname,
    lastName: req.body.lname,
    password: req.body.password,
    phoneNumber: req.body.phoneNumber,
    aptCode: req.body.aptCode,
  };
  
  return res.send(profile);
});