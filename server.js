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
  groceries: [
    {
      id: 0,
      name: 'Eggs',
      amount: '1 dozen',
      requestedBy: 'Bryce'
    },
    {
      id: 1,
      name: 'Soccer ball cupcakes',
      amount: null,
      requestedBy: 'Leon'
    },
    {
      id: 2,
      name: 'Tropicana OJ',
      amount: '1 gallon',
      requestedBy: 'Hannah'
    },
    {
      id: 3,
      name: 'Russet Potatoes',
      amount: '1 bag',
      requestedBy: 'Bryce'
    },
  ],
  inventory: [
    {
      id: 0,
      name: 'Orange bell pepper',
      amount: '2',
      requestedBy: 'Bryce'
    },
    {
      id: 1,
      name: '2% Milk',
      amount: 'Half gallon',
      requestedBy: 'Leon'
    },
    {
      id: 2,
      name: 'Ben & Jerry\'s',
      amount: '1 pint',
      requestedBy: 'Hannah'
    },
    {
      id: 3,
      name: 'Paprika',
      amount: null,
      requestedBy: 'Bryce'
    },
  ]
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
  res.json(groceryData.groceries);
  res.end();
});

app.get('/inventory', (req, res) => {
  res.send(groceryData.inventory);
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

app.put('/editGrocery', (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', () => {
    const element = JSON.parse(body);
    const index = groceryData.groceries.findIndex((obj) => obj.id === element.id)
    groceryData.groceries[index].name = element.name;
    groceryData.groceries[index].amount = element.amount;
  });
  res.end();
});

app.put('/editInventory', (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', () => {
    const element = JSON.parse(body);
    const index = groceryData.inventory.findIndex((obj) => obj.id === element.id)
    groceryData.inventory[index].name = element.name;
    groceryData.inventory[index].amount = element.amount;
  });
  res.end();
});

app.delete('/removeGrocery', (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', () => {
    const element = JSON.parse(body);
    const index = groceryData.groceries.findIndex((obj) => obj.id === element.id)
    groceryData.groceries.splice(index, 1);
  });
  res.end();
});

app.delete('/removeInventory', (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', () => {
    const element = JSON.parse(body);
    const index = groceryData.inventory.findIndex((obj) => obj.id === element.id)
    groceryData.inventory.splice(index, 1);
  });
  res.end();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
