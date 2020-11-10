
const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile('index.html');
});

let aptCosts = [

  { name: 'Rent', cost: 3000, contributions: [
      { user: { id: 'leon@gmail.com', name: 'leon', color: '20b2aa' }, percent: 33 }, 
      { user: { id: 'hannah@gmail.com', name: 'hannah', color: 'daa520' }, percent: 33 }, 
      { user: { id: 'bryce@gmail.com', name: 'bryce', color: '9400D3' }, percent: 34 }
  ]},
  { name: 'Gas', cost: 50, contributions: [
      { user: { id: 'leon@gmail.com', name: 'leon', color: '20b2aa' }, percent: 33 }, 
      { user: { id: 'hannah@gmail.com', name: 'hannah', color: 'daa520' }, percent: 33 }, 
      { user: { id: 'bryce@gmail.com', name: 'bryce', color: '9400D3' }, percent: 34 }
  ]}

]

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.get('/aptCosts', (req, res) => {
  res.send(aptCosts);
  res.end();
});

app.post('/addAptCost', (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', () => {
    const element = JSON.parse(body);
    aptCosts.push(element);
    console.log(aptCosts);
  });
  res.end();
});

app.put('/editAptCost', (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', () => {
    const element = JSON.parse(body);
    const index = aptCosts.findIndex((obj) => obj.name === element.name);
    aptCosts[index] = element;
  });
  res.end();
});

app.delete('/removeAptCost', (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', () => {
    const element = JSON.parse(body);
    const index = aptCosts.findIndex((obj) => obj.name === element.name);
    aptCosts = aptCosts.splice(index, 1);
  });
  res.end();
});
