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
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

let secret;

if (!process.env.SESSION_SECRET) { //If not on Heroku deployment
  const secrets = require('./secrets.json');
  secret = secrets.session_secret;
} else {
  secret = process.env.SESSION_SECRET;
}

app.use(session({ secret, resave: true, saveUninitialized: false }));


const port = process.env.PORT || 3000

const pgp = require("pg-promise")({
  connect(client) {
    //console.log('Connected to database:', client.connectionParameters.database);
  },

  disconnect(client) {
    //console.log('Disconnected from database:', client.connectionParameters.database);
  }
});

// Local PostgreSQL credentials
let url;

if (!process.env.DATABASE_URL) { //If not on Heroku deployment
  const secrets = require('./secrets.json');
  url = `postgres://${secrets.username}:${secrets.password}@localhost:${secrets.db_port}`;
} else {
  url = process.env.DATABASE_URL;
}

const db = pgp(url);

//only use first time creating tables
function createTables() {

  //User Profile Table
  db.none("CREATE TABLE IF NOT EXISTS UserProfile(firstName varchar(45), lastName varchar(45), email varchar(45), password varchar(45), phoneNumber varchar(11), AptId varchar(45), color varchar(45), primary key (email))", (err, res) => {
    console.log(err, res);
    db.end();
  });

  //User Bills Table
  //MONEY STORED AS CENTS
  db.none("CREATE TABLE IF NOT EXISTS UserGroceryBill(email varchar(45), GroceryBudget int, Spent int, primary key (email))", (err, res) => {
    console.log(err, res);
    db.end();
  });

  //User Payments Table
  //MONEY STORED AS CENTS
  db.none("CREATE TABLE IF NOT EXISTS UserPayments(email varchar(45), Name varchar(45), aptid varchar(45), BillName varchar(45), Payment int, BillType varchar(45))", (err, res) => {
    console.log(err, res);
    db.end();
  });

  //Apartment Table
  db.none("CREATE TABLE IF NOT EXISTS Apartment(id varchar(45), Rent int, NumMembers int, primary key (id))", (err, res) => {
    console.log(err, res);
    db.end();
  });

  //Utilities Table
  //MONEY STORED AS CENTS
  db.none("CREATE TABLE IF NOT EXISTS UtilityBills(BillName varchar(45), aptid varchar(45), Cost int, NumMembers int, primary key (BillName))", (err, res) => {
    console.log(err, res);
    db.end();
  });

  //Groceries Table, id references apartment id?
  db.none("CREATE TABLE IF NOT EXISTS Groceries(AptId varchar(45), id varchar(45), Name varchar(45), Amount varchar(45), requestedBy varchar(45), primary key (id))", (err, res) => {
    console.log(err, res);
    db.end();
  });

  //Inventory Table
  db.none("CREATE TABLE IF NOT EXISTS Inventory(AptId varchar(45), id varchar(45), Name varchar(45), Amount varchar(45), requestedBy varchar(45), primary key (id))", (err, res) => {
    console.log(err, res);
    db.end();
  });
}

createTables();

async function addTestData(){
  await connectAndRun(db => db.none('INSERT INTO Apartment VALUES( $/id/, $/rent/, $/num/)', { id: 0, rent: 75000, num: 3 }));
  await connectAndRun(db => db.none('INSERT INTO UserProfile VALUES( $/firstname/, $/lastname/, $/email/, $/password/, $/phonenumber/, $/aptid/, $/color/)', {  firstname: 'Bryce', lastname: 'Parkman', email: 'bparkman@umass.edu', password: 'brycepassword', phonenumber: '', aptid: 0, color: 'ff0000' }));
  await connectAndRun(db => db.none('INSERT INTO UserProfile VALUES( $/firstname/, $/lastname/, $/email/, $/password/, $/phonenumber/, $/aptid/, $/color/)', {  firstname: 'Hannah', lastname: 'Noordeen', email: 'hnoordeen@umass.edu', password: 'hannahpassword', phonenumber: '', aptid: 0, color: '00ff00' }));
  const {id, name, amount, requestedBy} = {id: 0, name: 'Eggs', amount: '1 dozen', requestedBy: 'bparkman@umass.edu'};
  const aptid = await getUserAptId('bparkman@umass.edu')
  await connectAndRun(db => db.none('INSERT INTO Groceries VALUES($/aptid/, $/id/, $/name/, $/amount/, $/requestedBy/)', {aptid, id, name, amount, requestedBy}));
  await connectAndRun(db => db.none('INSERT INTO UserGroceryBill VALUES( $/email/, $/budget/, $/spent/)', { email: 'bparkman@umass.edu', budget: 20000, spent: 0 }));
  await connectAndRun(db => db.none('INSERT INTO UserGroceryBill VALUES( $/email/, $/budget/, $/spent/)', { email: 'hnoordeen@umass.edu', budget: 20000, spent: 0 }));
}

//addTestData();

async function testFunctions(){
  console.log('AptId by email:', await getUserAptId('bparkman@umass.edu'));
  console.log('First name by email:', await getFirstNameByEmail('bparkman@umass.edu'));
  console.log('Groceries', await getGroceries());
  console.log('Inventory', await getInventory());
  let id = await getUserAptId('bparkman@umass.edu');
  const { rent } = await connectAndRun(db => db.one('SELECT Rent FROM Apartment WHERE id = $/id/', { id }));
  console.log('Rent: ', rent / 100);
  console.log('Rent payments: ', await connectAndRun(db => db.any('SELECT * FROM UserPayments WHERE aptid = $/id/ AND billtype = $/type/', { id, type: 'Rent' })))
  const { grocerybudget } = await connectAndRun(db => db.one('SELECT GroceryBudget FROM UserGroceryBill WHERE email = $/email/', { email: 'bparkman@umass.edu' }));
  console.log('Budget: ', grocerybudget / 100);
  const { spent } = await connectAndRun(db => db.one('SELECT Spent FROM UserGroceryBill WHERE email = $/email/', { email: 'bparkman@umass.edu' }));
  console.log('Spent: ', spent / 100);
}

testFunctions();

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

async function getUserAptId(email){
  const { aptid } = await connectAndRun(db => db.one('SELECT AptId FROM UserProfile WHERE email = $/email/', { email }));
  return aptid;
}

async function getFirstNameByEmail(email){
  const { firstname } = await connectAndRun(db => db.one('SELECT firstName FROM UserProfile WHERE email = $/email/', { email }));
  return firstname;
}

async function getGroceries() {
  const id = await getUserAptId('bparkman@umass.edu');
  return await connectAndRun(db => db.any('SELECT * from Groceries WHERE aptid = $/id/', { id }));
}

async function getInventory() {
  const id = await getUserAptId('bparkman@umass.edu');
  return await connectAndRun(db => db.any('SELECT * from Inventory WHERE aptid = $/id/', { id }));
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

app.get('/', (req, res) => {
  res.sendFile('index.html');
  res.end();
});

app.get('/rentPayments', async (req, res) => {
  const id = await getUserAptId('bparkman@umass.edu');
  res.json(await connectAndRun(db => db.any('SELECT * FROM UserPayments WHERE aptid = $/id/ AND billtype = $/type/', { id, type: 'Rent' })));
  res.end();
});

app.get('/rent', async (req, res) => {
  const id = await getUserAptId('bparkman@umass.edu');
  const { rent } = await connectAndRun(db => db.one('SELECT Rent FROM Apartment WHERE id = $/id/', { id }));
  res.json(rent / 100);
  res.end();
});

app.get('/name/:email', async (req, res) => {
  res.json(await getFirstNameByEmail(req.params.email));
  res.end();
})

app.post('/addPayment', async (req, res) => {
  const {email, amount} = req.body;
  const aptid = await getUserAptId('bparkman@umass.edu');
  const name = await getFirstNameByEmail(email);
  await connectAndRun(db => db.none('INSERT INTO UserPayments VALUES($/email/, $/name/, $/aptid/, $/billname/, $/amount/, $/billtype/)', { email, name, aptid, billname: 'Rent', amount, billtype: 'Rent' }));
  res.end();
});

app.get('/rentShare/:email', async (req, res) => {
  const id = await getUserAptId(req.params.email);
  const { nummembers } = await connectAndRun(db => db.one('SELECT NumMembers FROM Apartment WHERE id = $/id/', { id }));
  res.json(100 / nummembers);
  res.end();
});

app.get('/budget/:email', async (req, res) => {
  const email = req.params.email;
  const { grocerybudget } = await connectAndRun(db => db.one('SELECT GroceryBudget FROM UserGroceryBill WHERE email = $/email/', { email }));
  res.json(grocerybudget / 100);
  res.end();
});

app.get('/bill/:email', async (req, res) => {
  const email = req.params.email;
  const { spent } = await connectAndRun(db => db.one('SELECT Spent FROM UserGroceryBill WHERE email = $/email/', { email }));
  res.json(spent / 100);
  res.end();
});

app.put('/addBill', async (req, res) => {
  const {email, amount} = req.body;
  await connectAndRun(db => db.none('UPDATE UserGroceryBill SET Spent = Spent + $/amount/ WHERE email = $/email/', { email, amount }));
  res.end();
});

app.get('/groceries', async (req, res) => {
  res.json(await getGroceries());
  res.end();
});

app.get('/inventory', async (req, res) => {
  res.json(await getInventory());
  res.end();
});

app.post('/addGrocery', async (req, res) => {
  const groceries = await getGroceries();
  const aptid = await getUserAptId('bparkman@umass.edu');
  const id = groceries.length;
  const {name, amount, requestedBy} = req.body;
  await connectAndRun(db => db.none('INSERT INTO Groceries VALUES($/aptid/, $/id/, $/name/, $/amount/, $/requestedBy/)', {aptid, id, name, amount, requestedBy}));
  res.end();
});

app.post('/addInventory', async (req, res) => {
  const inventory = await getInventory();
  const aptid = await getUserAptId('bparkman@umass.edu');
  const id = inventory.length;
  const {name, amount, requestedBy} = req.body;
  await connectAndRun(db => db.none('INSERT INTO Inventory VALUES($/aptid/, $/id/, $/name/, $/amount/, $/requestedBy/)', {aptid, id, name, amount, requestedBy}));
  res.end();
});

app.put('/editGrocery', async (req, res) => {
  const {id, name, amount} = req.body;
  await connectAndRun(db => db.none('UPDATE Groceries SET Name = $/name/, Amount = $/amount/ WHERE id = $/id/', { id, name, amount }));
  res.end();
});

app.put('/editInventory', async (req, res) => {
  const {id, name, amount} = req.body;
  await connectAndRun(db => db.none('UPDATE Inventory SET Name = $/name/, Amount = $/amount/ WHERE id = $/id/', { id, name, amount }));
  res.end();
});

app.delete('/removeGrocery/:id', async (req, res) => {
  await connectAndRun(db => db.none('DELETE FROM Groceries WHERE id = $/id/', { id: req.params.id }));
  res.end();
});

app.delete('/removeInventory/:id', async (req, res) => {
  await connectAndRun(db => db.none('DELETE FROM Inventory WHERE id = $/id/', { id: req.params.id }));
  res.end();
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

app.get('/profiles', async (req, res) => {
  res.json(await connectAndRun(db => db.any('SELECT * FROM UserProfile', [])));
  res.end();
})

app.get('/loginProfile/:email', async (req, res) => {
  const email = req.params.email;
  res.end(JSON.stringify(
    await connectAndRun(db => db.any('SELECT password from UserProfile WHERE email = $1', [email]))))});

app.post('/userProfile', (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', () => {
    const data = JSON.parse(body);
    addUserProfile(data.fname, data.lname, data.email, data.password, data.phoneNumber, data.aptCode, data.color);
    res.end();
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});