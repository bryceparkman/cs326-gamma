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
  res.json(rentData.payments);
  res.end();
});

app.post('/addPayment', (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', () => {
    const element = JSON.parse(body);
    rentData.payments.push(element);
  });
  res.end();
});

app.get('/rentShare/:user', (req, res) => {
  res.json(rentData.shares[req.params.user]);
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
  res.json(groceryData.inventory);
  res.end();
});

app.post('/addGrocery', (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', () => {
    const element = JSON.parse(body);
    element['id'] = groceryData.groceries.length;
    groceryData.groceries.push(element);
  });
  res.end();
});

app.post('/addInventory', (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', () => {
    const element = JSON.parse(body);
    element['id'] = groceryData.inventory.length;
    groceryData.inventory.push(element);
  });
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
      color: data.color,
      aptCode: data.aptCode
    };
    userProfiles.profiles.push(profile);
  });
  res.end();
});