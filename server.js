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

  { name: 'Rent', cost: 3000, contributions: [
      { user: { id: 'leon@gmail.com', name: 'leon', color: '0000ff' }, percent: 33 }, 
      { user: { id: 'hannah@gmail.com', name: 'hannah', color: 'ff0000' }, percent: 33 }, 
      { user: { id: 'bryce@gmail.com', name: 'bryce', color: '00ff00' }, percent: 34 }
  ]},
  { name: 'Gas', cost: 50, contributions: [
      { user: { id: 'leon@gmail.com', name: 'leon', color: '0000ff' }, percent: 33 }, 
      { user: { id: 'hannah@gmail.com', name: 'hannah', color: 'ff0000' }, percent: 33 }, 
      { user: { id: 'bryce@gmail.com', name: 'bryce', color: '00ff00' }, percent: 34 }
  ]},
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
const port = process.env.PORT || 3000

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
  const secrets = require('./secrets.json');
  username = secrets.username;
} else {
  username = process.env.USERNAME;
}

if (!process.env.PASSWORD) {
  const secrets = require('./secrets.json');
  password = secrets.password;
} else {
  password = process.env.PASSWORD;
}


const url = process.env.DATABASE_URL || `postgres://${username}:${password}@localhost/`;
const db = pgp(url);

//only use first time creating tables
function createTables() {

  //User Profile Table
  db.none("CREATE TABLE UserProfile(firstName varchar(45), lastName varchar(45), email varchar(45), password varchar(45), phoneNumber varchar(11), AptId varchar(45), color varchar(45), primary key (email))", (err, res) => {
    console.log(err, res);
    db.end();
  });

  //User Bills Table
  //MONEY STORED AS CENTS
  db.none("CREATE TABLE UserGroceryBill(email varchar(45), GroceryBudget int, Spent int, primary key (email))", (err, res) => {
    console.log(err, res);
    db.end();
  });

  //User Payments Table
  //MONEY STORED AS CENTS
  db.none("CREATE TABLE UserPayments(email varchar(45), Name varchar(45), id varchar(45), BillName varchar(45), Payment int, BillType varchar(45), primary key (email))", (err, res) => {
    console.log(err, res);
    db.end();
  });

  //Apartment Table
  db.none("CREATE TABLE Apartment(id varchar(45), Rent int, NumMembers int, primary key (id))", (err, res) => {
    console.log(err, res);
    db.end();
  });

  //Costs Table, each bill has a relating costs table
  db.none("CREATE TABLE Costs(AptCode varchar(45), BillName varchar foreign key references Bill, UnpaidDollars int, UnpaidPercent int, Progress int, primary key (AptCode))", (err, res) => {
    console.log(err, res);
    db.end();
  });

  //Utilities Table
  //MONEY STORED AS CENTS
  db.none("CREATE TABLE UtilityBills(BillName varchar(45), id varchar(45), Cost int, NumMembers int, primary key (BillName))", (err, res) => {
    console.log(err, res);
    db.end();
  });

  //Groceries Table, id references apartment id?
  db.none("CREATE TABLE Groceries(AptId varchar(45), id varchar(45), Name varchar(45), Amount varchar(45), requestedBy varchar(45), primary key (AptId))", (err, res) => {
    console.log(err, res);
    db.end();
  });

  //Inventory Table
  db.none("CREATE TABLE Inventory(AptId varchar(45), id varchar(45), Name varchar(45), Amount varchar(45), requestedBy varchar(45), primary key (AptId))", (err, res) => {
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
  return await connectAndRun(db => db.any('SELECT * FROM UserProfile', []));
}

async function getUserPassword(email) {
  return await connectAndRun(db => db.any('SELECT password FROM UserProfile WHERE email = $/email/', { email }));
}

async function getUserAptId(email){
  return await connectAndRun(db => db.any('SELECT AptId FROM UserProfile WHERE email = $/email/', { email }));
}

async function getUserBudget(email){
  return await connectAndRun(db => db.any('SELECT GroceryBudget FROM UserGroceryBill WHERE email = $/email/', { email })) / 100;
}

async function getUserBill(email){
  return await connectAndRun(db => db.any('SELECT Spent FROM UserGroceryBill WHERE email = $/email/', { email })) / 100;
}

async function addUserBill(email, amount){
  return await connectAndRun(db => db.none('UPDATE UserGroceryBill SET Spent = Spent + $/amount/ WHERE email = $/email/', { email, amount }));
}

async function getRent(email) {
  const id = await getUserAptId(email);
  return await connectAndRun(db => db.any('SELECT Rent FROM Apartment WHERE id = $/id/', { id })) / 100;
}

async function getRentPayments(email) {
  const id = await getUserAptId(email);
  return await connectAndRun(db => db.any('SELECT * FROM UserPayments WHERE BillType = Rent', { id }));
}

async function getNumMembers(email) {
  const id = await getUserAptId(email);
  return await connectAndRun(db => db.any('SELECT NumMembers FROM Apartment WHERE id = $/id/', { id }));
}

async function getRentShares(email) {
  const numMembers = await getNumMembers(email);
  return 100 / numMembers //assume even split for now
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
  const groceries = await getGroceries();
  return await connectAndRun(db => db.none('INSERT INTO Grocery VALUES($/id/, $/name/, $/quantity/, $/requestedBy/)', {
    id: groceries.length,
    name: name,
    quantity: quantity,
    requestedBy: requestedBy
  }));
}

async function addInventory(name, quantity, requestedBy) {
  const inventory = await getInventory();
  return await connectAndRun(db => db.none('INSERT INTO Inventory VALUES($/id/, $/name/, $/quantity/, $/requestedBy/)', {
    id: inventory.length,
    name: name,
    quantity: quantity,
    requestedBy: requestedBy
  }));
}

async function editGrocery(id, name, amount) {
  return await connectAndRun(db => db.none('UPDATE Grocery SET Name = $/name/, Amount = $/amount$ WHERE id = $/id/', { id, name, amount }));
}

async function editInventory(id, name, amount) {
  return await connectAndRun(db => db.none('UPDATE Inventory SET Name = $/name/, Amount = $/amount$ WHERE id = $/id/', { id, name, amount }));
}

async function deleteGrocery(id) {
  return await connectAndRun(db => db.none('DELETE FROM Grocery WHERE id = $/id/', { id }));
}

async function deleteInventory(id) {
  return await connectAndRun(db => db.none('DELETE FROM Inventory WHERE id = $/id/', { id }));
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

async function getAptCosts(id) {

  // grab utilities
  let utilities = await connectAndRun(db => db.any('SELECT * FROM UtilityBills WHERE id = $/id/'), {
    id: id,
  })

  // populate utilities with contributors
  for (let i = 0; i < utilities.length; i++) {

    let utility = utilities[i];
    let contributors = await connectAndRun(db => db.any('SELECT email FROM UserPayments WHERE id = $/id/ AND BillName = $/billName/'), {
      id: id,
      billName: utility.name
    })
    utility['contributors'] = contributors;

  }

  return utilities;
}

async function addAptCosts(id, name, cost, contributors) {
  
  // add utility
  await connectAndRun(db => db.none('INSERT INTO UtilityBills VALUES($/billName/, $/id/, $/cost/, $/numMembers/)'), {
    name: name,
    id: id,
    cost: cost,
    numMembers: contributors.length,
  })

  // add user payments
  for (let i = 0; i < contributors.length; i++) {
    await connectAndRun(db => db.none('INSERT INTO UserPayments VALUES($/email/, $/name/, $/id/, $/billName/, $/cost/, $/type/)'), {
      email: contributors[i],
      name: '',
      id: id,
      billName: name,
      cost: cost,
      type: name === 'rent' ? 'rent' : 'utility',
    })
  }
  return
}

async function editAptCosts(id, name, cost, contributors, contributorsAdded, contributorsDropped) {
  
  // update utility
  await connectAndRun(db => db.none('UPDATE UtilityBills SET cost = $/cost/, numMembers = $/numMembers/ WHERE AptCode = $/id/ AND name = $/name/'), {
    id: id,
    name: name,
    cost: cost,
    numMembers: contributors.length,
  })

  // add user payment for new contributors
  for (let i = 0; i < contributorsAdded.length; i++) {
    await connectAndRun(db => db.none('INSERT INTO UserPayments VALUES($/email/, $/name/, $/id/, $/billName/, $/cost/, $/type/)'), {
      email: contributersAdded[i],
      name: '',
      id: id,
      billName: name,
      cost: cost,
      type: name === 'rent' ? 'rent' : 'utility',
    })
  }

  // remove user payment for new contributors
  for (let i = 0; i < contributorsDropped.length; i++) {
    await connectAndRun(db => db.none('DELETE FROM UserPayments WHERE id = $/id/ AND email = $/email/ AND BillName = $/billName/'), {
      email: contributersDropped[i],
      id: id,
      billName: name,
    })
  }

  // update user payments in case cost changed
  await connectAndRun(db => db.none('UPDATE UserPayments SET Payment = $/payment/ WHERE id = $/id/ AND BillName = $/billName/'), {
    id: id,
    email: contributors[i],
    payment: cost/contributors.length,
    billName: name,
  })

  return
}

async function deleteAptCosts(id, name) {

  // delete utility
  await connectAndRun(db => db.none('DELETE FROM UtilityBills WHERE AptCode = $/code/ AND name = $/name/'), {
    id: id,
    name: name,
  })

  // delete user payments
  await connectAndRun(db => db.none('DELETE FROM UserPayments WHERE id = $/code/ AND BillName = $/billName/'), {
    id: id,
    billName: name,
  })

  return
}

async function getAptCodes() {
  // get all apt codes
  return await connectAndRun(db => db.none('SELECT id FROM Apartments'))
}

async function getUsersInApt(id) {
  // get all apt codes
  return await connectAndRun(db => db.none('SELECT * FROM UserProfile WHERE AptId = $/id/', {
    id: id,
  }))
}

async function addAptCode(id, rent) {
  
  // add utility
  await connectAndRun(db => db.none('INSERT INTO Apartment VALUES($/id/, $/rent/, $/numMembers/)'), {
    id: id,
    rent: rent,
    numMembers: 1,
  })

  return
}

app.get('/aptCosts/:id', (req, res) => {
  res.send(getAptCosts(req.params.id));
  res.end();
});

app.post('/addAptCost', (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', () => {
    const element = JSON.parse(body);
    addAptCosts(element.id, element.name, element.cost, element.contributors);
  });
  res.end();
});

app.put('/editAptCost', (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', () => {
    const element = JSON.parse(body);
    editAptCosts(element.id, element.name, element.cost, element.contributors, element.contributorsAdded, element.contributorsDropped);
  });
  res.end();
});

app.delete('/removeAptCost', (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', () => {
    const element = JSON.parse(body);
    deleteAptCosts(element.id, element.name);
  });
  res.end();
});

app.get('/allAptCodes', (req, res) => {
  res.send(getAptCodes());
  res.end();
});

app.get('/allUsersInApt/:id', (req, res) => {
  res.send(getUsersInApt(req.params.id));
  res.end();
});

app.post('/createApartment', (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', () => {
    const element = JSON.parse(body);
    addAptCode(element.id, element.rent);
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

