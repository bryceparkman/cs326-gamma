const rentData = {
  totalRent: 600,
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

let prof1 = {
  firstName: "Hannah",
  lastName: "Noordeen",
  email: "hnoordeen@umass.edu",
  password: "password",
  phoneNumber: "7777777777",
  aptCode: "code123",
  color: 'ff0000'
};

let prof2 = {
  firstName: "Bryce",
  lastName: "Parkman",
  email: "bparkman@umass.edu",
  password: "brycepassword",
  phoneNumber: "7777777777",
  aptCode: "code123",
  color: '00ff00'
};

let prof3 = {
  firstName: "Leon",
  lastName: "Djusberg",
  email: "ldjusberg@umass.edu",
  password: "leonpassword",
  phoneNumber: "7777777777",
  aptCode: "20b2aa",
  color: '0000ff'
};

const userProfiles = {
  profiles: []
};
userProfiles.profiles.push(prof1);
userProfiles.profiles.push(prof2);
userProfiles.profiles.push(prof3);

let aptCosts = [

  {
    name: 'Rent', cost: 3000, contributions: [
      { user: { id: 'leon@gmail.com', name: 'leon', color: '20b2aa' }, percent: 33 },
      { user: { id: 'hannah@gmail.com', name: 'hannah', color: 'daa520' }, percent: 33 },
      { user: { id: 'bryce@gmail.com', name: 'bryce', color: '9400D3' }, percent: 34 }
    ]
  },
  {
    name: 'Gas', cost: 50, contributions: [
      { user: { id: 'leon@gmail.com', name: 'leon', color: '20b2aa' }, percent: 33 },
      { user: { id: 'hannah@gmail.com', name: 'hannah', color: 'daa520' }, percent: 33 },
      { user: { id: 'bryce@gmail.com', name: 'bryce', color: '9400D3' }, percent: 34 }
    ]
  }

]


const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const secrets = require('secrets.json');

const pgp = require("pg-promise")({
  connect(client) {
    console.log('Connected to database:', client.connectionParameters.database);
  },

  disconnect(client) {
    console.log('Disconnected from database:', client.connectionParameters.database);
  }
});

// Local PostgreSQL credentials
let username;
let password;

if (!process.env.USERNAME) {
  username = secrets.username;
} else {
  username = process.env.USERNAME;
}

if (!process.env.PASSWORD) {
  password = secrets.password;
} else {
  password = process.env.PASSWORD;
}


const url = process.env.DATABASE_URL || `postgres://${username}:${password}@localhost/`;
const db = pgp(url);

//only use first time creating tables
function createTables() {

  //User Profile Table
  db.none("CREATE TABLE UserProfile(firstName varchar(45), lastName varchar(45), email varchar(45), password varchar(45), phoneNumber varchar(11), aptCode varchar(45), color varchar(45), primary key (email))", (err, res) => {
    console.log(err, res);
    db.end();
  });

  //User Bills Table
  db.none("CREATE TABLE UserBills(email varchar(45), RentOwed int, RentPaid int, NumBills int, GroceryBudget int, OutstandingPayments int, primary key (email))", (err, res) => {
    console.log(err, res);
    db.end();
  });

  //Apartment Table
  db.none("CREATE TABLE Apartment(AptCode varchar(45), Rent int, NumMembers int, primary key (AptCode))", (err, res) => {
    console.log(err, res);
    db.end();
  });

  //Bill Table, create a new bill table for each bill added
  db.none("CREATE TABLE Bill(BillName varchar(45), cost int, NumMembers int, primary key (BillName))", (err, res) => {
    console.log(err, res);
    db.end();
  });

  //Costs Table, each bill has a relating costs table
  db.none("CREATE TABLE Costs(AptCodevarchar(45), BillName varchar foreign key references Bill, UnpaidDollars int, UnpaidPercent int, Progress int, primary key (AptCode))", (err, res) => {
    console.log(err, res);
    db.end();
  });

  //Groceries Table, id references apartment id?
  db.none("CREATE TABLE Groceries(id varchar(45), Name varchar(45), Amount varchar(45), requestedBy varchar (45), primary key (id))", (err, res) => {
    console.log(err, res);
    db.end();
  });

  //Inventory Table
  db.none("CREATE TABLE Invenory(id varchar(45), Name varchar(45), Amount varchar(45), requestedBy varchar(45), Cost integer, primary key (id))", (err, res) => {
    console.log(err, res);
    db.end();
  });
}

//uncomment this lines if tables haven't been created
//createTables();


async function connectAndRun(task) {
  let connection = null;

  try {
    connection = await db.connect();
    return await task(connection);
  } catch (e) {
    throw e;
  } finally {
    try {
      connection.done();
    } catch (ignored) {

    }
  }
}

async function getProfiles() {
  return await connectAndRun(db => db.any('SELECT * from UserProfile', []));
}

async function getUserPassword(email) {
  return await connectAndRun(db => db.any('SELECT password from UserProfile WHERE email = $/email/', {
    email: email
  }));
}


//add aptCode or some apartment id 
async function getRent() {
  return await connectAndRun(db => db.any('SELECT Rent FROM Apartment', []));
}

async function getGroceries() {
  return await connectAndRun(db => db.any('SELECT * from Groceries', []));
}

async function getInventory() {
  return await connectAndRun(db => db.any('SELECT * from Inventory', []));
}

async function addUserProfile(firstName, lastName, email, password, phoneNumber, aptCode, color) {
  return await connectAndRun(db => db.none('INSERT INTO UserProfile VALUES($/firstName/, $/lastName/, $/email/, $/password/, $/phoneNumber/, $/aptCode/, $/color/)', {
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    phoneNumber: phoneNumber,
    aptCode: aptCode,
    color: color
  }));
}

async function addGrocery(name, quantity, requestedBy) {
  return await connectAndRun(db => db.none('INSERT INTO Grocery VALUES($/name/, $/quantity/, $/requestedBy/)', {
    name: name,
    quantity: quantity,
    requestedBy: requestedBy
  }));
}

async function addInventory(name, quantity, requestedBy, cost) {
  return await connectAndRun(db => db.none('INSERT INTO Grocery VALUES($/name/, $/quantity/, $/requestedBy/, $/cost/)', {
    name: name,
    quantity: quantity,
    requestedBy: requestedBy,
    cost: cost
  }));
}

//can change name to id depending on how items are classified
async function deleteGrocery(name) {
  return await connectAndRun(db => db.none('DELETE FROM Grocery WHERE name = $/name/', {
    name: name,
  }));
}

//can change name to id depending on how items are classified
async function deleteInventory(name) {
  return await connectAndRun(db => db.none('DELETE FROM Inventory WHERE name = $/name/', {
    name: name,
  }));
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

app.get('/rent', (req, res) => {
  res.json(rentData.totalRent);
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



app.get('/profiles', (req, res) => {
  res.json(userProfiles.profiles);
  res.end();
})

app.get('/loginProfile/:email', (req, res) => {
  const email = req.params.email;
  for (let i = 0; i < userProfiles.profiles.length; i++) {
    profile = userProfiles.profiles[i];
    if (profile.email === email) {
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
    addUserProfile(data.fname, data.lname, data.email, data.password, data.phoneNumber, data.aptCode, data.color);
    res.end();
  });
});

