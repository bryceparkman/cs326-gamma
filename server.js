
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


let prof1 = {
  firstName: "Hannah",
  lastName: "Noordeen",
  email:"hnoordeen@umass.edu",
  password: "password",
  phoneNumber: "7777777777",
  aptCode: "code123"
};

let prof2 = {
  firstName: "Bryce",
  lastName: "Parkman",
  email:"bparkman@umass.edu",
  password: "brycepassword",
  phoneNumber: "7777777777",
  aptCode: "code123"
};

let prof3 = {
  firstName: "Leon",
  lastName: "Djusberg",
  email:"ldjusberg@umass.edu",
  password: "leonpassword",
  phoneNumber: "7777777777",
  aptCode: "code123"
};

userProfiles.profiles.push(prof1);
userProfiles.profiles.push(prof2);
userProfiles.profiles.push(prof3);


app.get('/loginProfile/:email', (req, res) => {
    const email = req.params.email;
    for(let i = 0; i < userProfiles.profiles.length; i++){
      profile = userProfiles.profiles[i];
      if(profile.email === email){
        //console.log(profile.password);
        res.json(profile.password);
        res.end();
      }
    }
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