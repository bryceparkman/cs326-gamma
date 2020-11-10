const express = require('express');
const app = express();
const port = 3000;

const rentData = {
  shares: {
    'Bryce': 33.3333,
    'Leon': 33.3333,
    'Hannah': 33.3333
  },
  payments: []
};

const groceryData = {
  bills: {
    'Bryce': 100,
    'Hannah': 0,
    'Leon': 0
  },
  budgets: {
    'Bryce': 200,
    'Hannah': 200,
    'Leon': 200
  },
  groceries: [],
  inventory: []
}

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile('index.html');
  res.end();
});

app.get('/rentPayments', (req, res) => {
  res.send(rentData.payments);
  res.end();
});

app.post('/addPayment', (req, res) => {
  rentData.payments.push(res.body);
  res.end();
});

app.get('/rentShare/:user', (req, res) => {
  res.send(rentData.shares[req.params.user]);
  res.end();
});

app.get('/budget/:user', (req, res) => {
  res.json(groceryData.budgets[req.params.user]);
  res.end();
});

app.get('/bill/:user', (req, res) => {
  res.json(groceryData.bills[req.params.user]);
  res.end();
});

app.put('/addBill', (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', () => {
      const data = JSON.parse(body);
      groceryData.bills[data.user] += data.amount;
  });
  res.end();
});

app.get('/groceries', (req, res) => {
  res.send(groceryData.groceries);
  res.end();
});

app.post('/addGrocery', (req, res) => {
  groceryData.groceries.push(res.body);
  res.end();
});

app.post('/addInventory', (req, res) => {
  groceryData.inventory.push(res.body);
  res.end();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
