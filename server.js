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
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

let secret;

const currentEmail = 'bparkman@umass.edu'

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

  //Costs Table, each bill has a relating costs table
  db.none("CREATE TABLE IF NOT EXISTS Costs(AptCode varchar(45), BillName varchar(45), UnpaidDollars int, UnpaidPercent int, Progress int, primary key (AptCode))", (err, res) => {
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
  // await connectAndRun(db => db.none('INSERT INTO Apartment VALUES( $/id/, $/rent/, $/num/)', { id: 0, rent: 75000, num: 3 }));
  // await connectAndRun(db => db.none('INSERT INTO UserProfile VALUES( $/firstname/, $/lastname/, $/email/, $/password/, $/phonenumber/, $/aptid/, $/color/)', {  firstname: 'Bryce', lastname: 'Parkman', email: 'bparkman@umass.edu', password: 'brycepassword', phonenumber: '', aptid: 0, color: 'ff0000' }));
  // await connectAndRun(db => db.none('INSERT INTO UserProfile VALUES( $/firstname/, $/lastname/, $/email/, $/password/, $/phonenumber/, $/aptid/, $/color/)', {  firstname: 'Hannah', lastname: 'Noordeen', email: 'hnoordeen@umass.edu', password: 'hannahpassword', phonenumber: '', aptid: 0, color: '00ff00' }));
  // const {id, name, amount, requestedBy} = {id: 0, name: 'Eggs', amount: '1 dozen', requestedBy: 'bparkman@umass.edu'};
  // const aptid = await getUserAptId(currentEmail)
  // await connectAndRun(db => db.none('INSERT INTO Groceries VALUES($/aptid/, $/id/, $/name/, $/amount/, $/requestedBy/)', {aptid, id, name, amount, requestedBy}));
  // await connectAndRun(db => db.none('INSERT INTO UserGroceryBill VALUES( $/email/, $/budget/, $/spent/)', { email: 'bparkman@umass.edu', budget: 20000, spent: 0 }));
  // await connectAndRun(db => db.none('INSERT INTO UserGroceryBill VALUES( $/email/, $/budget/, $/spent/)', { email: 'hnoordeen@umass.edu', budget: 20000, spent: 0 }));
  await connectAndRun(db => db.none('INSERT INTO UtilityBills VALUES( $/billname/, $/id/, $/cost/, $/nummembers/)', { billname: 'Electric', id: 0, cost: 100, nummembers: 3 }));
  await connectAndRun(db => db.none('INSERT INTO UtilityBills VALUES( $/billname/, $/id/, $/cost/, $/nummembers/)', { billname: 'Water', id: 0, cost: 100, nummembers: 3 }));
}

//addTestData();

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
  const id = await getUserAptId(currentEmail);
  return await connectAndRun(db => db.any('SELECT * from Groceries WHERE aptid = $/id/', { id }));
}

async function getInventory() {
  const id = await getUserAptId(currentEmail);
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

async function getAptCosts(id) {

  // grab utilities
  let utilities = await connectAndRun(db => db.any('SELECT BillName, aptid, Cost FROM UtilityBills WHERE aptid = $/id/', {
    id: id,
  }));

  // populate utilities with contributors
  for (let i = 0; i < utilities.length; i++) {

    let utility = utilities[i];
    let contributors = await connectAndRun(db => db.any('SELECT email FROM UserPayments WHERE aptid = $/id/ AND BillName = $/billName/', {
      id: id,
      billName: utility.billname,
    }));
    utility.contributors = []
    
    for (let i = 0; i < contributors.length; i++) {
      utility.contributors.push(contributors[i].email)
    }

  }

  return utilities;
}

async function addAptCosts(id, name, cost, contributors) {

  // add utility
  await connectAndRun(db => db.none('INSERT INTO UtilityBills VALUES( $/name/, $/id/, $/cost/, $/numMembers/ )', {
    name: name,
    id: id,
    cost: cost,
    numMembers: contributors.length,
  }));

  // add user payments
  for (let i = 0; i < contributors.length; i++) {
    await connectAndRun(db => db.none('INSERT INTO UserPayments VALUES($/email/, $/name/, $/id/, $/billName/, $/cost/, $/type/)', {
      email: contributors[i],
      name: '',
      id: id,
      billName: name,
      cost: cost/contributors.length,
      type: name === 'rent' ? 'rent' : 'utility',
    }));
  }
  return;
}

async function editAptCosts(id, name, cost, contributors, contributorsAdded, contributorsDropped) {
  
  // update utility
  await connectAndRun(db => db.none('UPDATE UtilityBills SET cost = $/cost/, numMembers = $/numMembers/ WHERE aptid = $/id/ AND BillName = $/name/', {
    id: id,
    name: name,
    cost: cost,
    numMembers: contributors.length,
  }));

  // add user payment for new contributors
  for (let i = 0; i < contributorsAdded.length; i++) {
    await connectAndRun(db => db.none('INSERT INTO UserPayments VALUES($/email/, $/name/, $/id/, $/billName/, $/cost/, $/type/)', {
      email: contributersAdded[i],
      name: '',
      id: id,
      billName: name,
      cost: cost,
      type: name === 'rent' ? 'rent' : 'utility',
    }));
  }

  // remove user payment for new contributors
  for (let i = 0; i < contributorsDropped.length; i++) {
    await connectAndRun(db => db.none('DELETE FROM UserPayments WHERE aptid = $/id/ AND email = $/email/ AND BillName = $/billName/', {
      email: contributersDropped[i],
      id: id,
      billName: name,
    }));
  }

  // update user payments in case cost changed
  if (contributors.length > 0) {
    await connectAndRun(db => db.none('UPDATE UserPayments SET Payment = $/payment/ WHERE aptid = $/id/ AND BillName = $/billName/', {
      id: id,
      payment: cost/contributors.length,
      billName: name,
    }));
  }

  return;
}

async function removeAptCost(id, name) {

  console.log('testccc')
  // delete utility
  await connectAndRun(db => db.none('DELETE FROM UtilityBills WHERE aptid = $/id/ AND BillName = $/name/', {
    id: id,
    name: name,
  }));

  // delete user payments
  await connectAndRun(db => db.none('DELETE FROM UserPayments WHERE aptid = $/id/ AND BillName = $/billName/', {
    id: id,
    billName: name,
  }));

  return;
}

async function getAptCodes() {
  // get all apt codes
  return await connectAndRun(db => db.any('SELECT id FROM Apartment'));
}

async function getUsersInApt(id) {
  // get all apt codes
  return await connectAndRun(db => db.any('SELECT firstName, email, AptId, color FROM UserProfile WHERE AptId = $/id/', {
    id: id,
  }));
}

async function addAptCode(id, rent) {
  
  // add utility
  await connectAndRun(db => db.none('INSERT INTO Apartment VALUES($/id/, $/rent/, $/numMembers/)', {
    id: id,
    rent: rent,
    numMembers: 1,
  }))

  return;
}

//async function getEmails() {
  //return await connectAndRun(db => db.any('SELECT email from userprofile;'));
//}

app.get('/', (req, res) => {
  res.sendFile('index.html');
  res.end();
});

app.get('/payments/:type', async (req, res) => {
  const id = await getUserAptId(currentEmail);
  res.json(await connectAndRun(db => db.any('SELECT * FROM UserPayments WHERE aptid = $/id/ AND billname = $/type/', { id, type : req.params.type })));
  res.end();
});

app.get('/cost/:type', async (req, res) => {
  const id = await getUserAptId(currentEmail);
  if(req.params.type === 'Rent'){
    const { rent } = await connectAndRun(db => db.one('SELECT Rent FROM Apartment WHERE id = $/id/', { id }));
    res.json(rent / 100);
  }
  else {
    const { cost } = await connectAndRun(db => db.one('SELECT cost FROM UtilityBills WHERE aptid = $/id/ AND billname = $/type/', { id, type: req.params.type }));
    res.json(cost / 100);
  }
  res.end();
});

app.get('/name/:email', async (req, res) => {
  res.json(await getFirstNameByEmail(req.params.email));
  res.end();
})

app.post('/addPayment', async (req, res) => {
  const {email, amount, billname, billtype} = req.body;
  const aptid = await getUserAptId(currentEmail);
  const name = await getFirstNameByEmail(email);
  await connectAndRun(db => db.none('INSERT INTO UserPayments VALUES($/email/, $/name/, $/aptid/, $/billname/, $/amount/, $/billtype/)', { email, name, aptid, billname, amount, billtype }));
  res.end();
});

app.get('/share/:email', async (req, res) => {
  const id = await getUserAptId(req.params.email);
  const { nummembers } = await connectAndRun(db => db.one('SELECT NumMembers FROM Apartment WHERE id = $/id/', { id }));
  res.json(100 / nummembers); //assume equal portions
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
  const aptid = await getUserAptId(currentEmail);
  const id = groceries.length;
  const {name, amount, requestedBy} = req.body;
  await connectAndRun(db => db.none('INSERT INTO Groceries VALUES($/aptid/, $/id/, $/name/, $/amount/, $/requestedBy/)', {aptid, id, name, amount, requestedBy}));
  res.end();
});

app.post('/addInventory', async (req, res) => {
  const inventory = await getInventory();
  const aptid = await getUserAptId(currentEmail);
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

//id should be pulled from current user email
app.get('/aptCosts/:id', async (req, res) => {
  const costs = await getAptCosts(req.params.id);
  res.json(costs);
  res.end();
});

app.post('/addAptCost', async (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', async () => {
    const element = JSON.parse(body);
    await addAptCosts(element.id, element.name, element.cost, element.contributors);
  });
  res.end();
});

app.put('/editAptCost', async (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', async () => {
    const element = JSON.parse(body);
    await editAptCosts(element.id, element.name, element.cost, element.contributors, element.contributorsAdded, element.contributorsDropped);
  });
  res.end();
});

app.delete('/removeAptCost', async (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', async () => {
    const element = JSON.parse(body);
    await removeAptCost(element.id, element.name);
  });
  res.end();
});

app.get('/allAptCodes', async (req, res) => {
  res.send(await getAptCodes());
  res.end();
});

app.get('/allUsersInApt/:id', async (req, res) => {
  res.send(await getUsersInApt(req.params.id));
  res.end();
});

app.post('/createApartment', async (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', async () => {
    const element = JSON.parse(body);
    await addAptCode(element.id, element.rent);
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
    await connectAndRun(db => db.one('SELECT password from UserProfile WHERE email = $1', [email]))))});

app.get('/email/:email', async (req, res) => {
  const email = req.params.email;
  let isUnique = true;
  let emailList = await connectAndRun(db => db.any('SELECT email from userprofile;'));
  for (let tempemail = 0; tempemail < emailList.length; tempemail++){
    let temp = emailList[tempemail].email;
    if(temp === email)
      isUnique = false;
  }
  if(isUnique)
    res.json(("true"));
  else 
    res.json(("false"));
  res.end();
});

app.post('/userProfile', (req, res) => {
  const {fname, lname, email, password, phoneNumber, aptCode, color} = req.body;
  addUserProfile(fname, lname, email,password, phoneNumber, aptCode, color);
  res.end();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});