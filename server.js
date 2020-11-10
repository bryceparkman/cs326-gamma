
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

const userProfiles = {
  profiles: []
};

app.get('/loginProfile:user', (req, res) => {
  res.send(userProfiles.profiles[req.params.user]);
  res.end();
});


app.post('/userProfile', (req, res) => {
  let body = '';
        req.on('data', data => body += data);
        req.on('end', () => {
            const data = JSON.parse(body);
        const profile = {
          firstName: data.fname,
          lastName: data.lname,
          email:data.email,
          password: data.password,
          phoneNumber: data.phoneNumber,
          aptCode: data.aptCode
          };

          userProfiles.profiles.push(profile);
    });
    res.end();
});