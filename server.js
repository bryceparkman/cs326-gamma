const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const minicrypt = require('./miniCrypt');

const mc = new minicrypt();
const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

let secret;

//If not on Heroku deployment, access secrets
if (!process.env.SESSION_SECRET) {
  const secrets = require('./secrets.json');
  secret = secrets.session_secret;
} else {
  secret = process.env.SESSION_SECRET;
}

app.use(session({ secret, resave: true, saveUninitialized: false }));

const port = process.env.PORT || 3000;

const pgp = require("pg-promise")({
  connect(client) {},
  disconnect(client) {}
});

// Local PostgreSQL credentials
let url;

//If not on Heroku deployment
if (!process.env.DATABASE_URL) {
  const secrets = require('./secrets.json');
  url = `postgres://${secrets.username}:${secrets.password}@localhost:${secrets.db_port}`;
} else {
  url = process.env.DATABASE_URL;
}

const db = pgp(url);

/**
 * Creates database tables if they do not exist
 */
function createTables() {
  //User Profile Table
  db.none("CREATE TABLE IF NOT EXISTS UserProfile(firstName varchar(45), lastName varchar(45), email varchar(45), salt varchar(45), password varchar(200), phoneNumber varchar(11), AptId varchar(45), color varchar(45), primary key (email))", (err, res) => {
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
/**
 * @callback queryCallback
 * @param {object} db Database variable
 */

/**
 * Uses db query and connects to PostgreSQL
 * @param {queryCallback} task Database callback function containing the query. 
 */
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

/**
 * Gets user's associated apartment id
 * @param {string} email User's email
 */
async function getUserAptId(email){
  const { aptid } = await connectAndRun(db => db.one('SELECT AptId FROM UserProfile WHERE email = $/email/', { email }));
  return aptid;
}

/**
 * Gets user's first name
 * @param {string} email User's email
 */
async function getFirstNameByEmail(email){
  const { firstname } = await connectAndRun(db => db.one('SELECT firstName FROM UserProfile WHERE email = $/email/', { email }));
  return firstname;
}

/**
 * Gets grocery data
 */
async function getGroceries(currentUser) {
  const id = currentUser.aptid
  return await connectAndRun(db => db.any('SELECT * from Groceries WHERE aptid = $/id/', { id }));
}

/**
 * Gets inventory data
 */
async function getInventory(currentUser) {
  const id = currentUser.aptid
  return await connectAndRun(db => db.any('SELECT * from Inventory WHERE aptid = $/id/', { id }));
}

/**
 * Adds user profile to the database
 * @param {string} firstName First name of the user
 * @param {string} lastName Last name of the user
 * @param {string} email Email of the user
 * @param {string} password Hashed password for the user
 * @param {string} phoneNumber Phone numnber of the user
 * @param {number} aptCode Associated apartment code of the user
 * @param {string} color Color of the user
 */
async function addUserProfile(firstName, lastName, email, salt, password, phoneNumber, aptCode, color) {
  return await connectAndRun(db => db.none('INSERT INTO UserProfile VALUES($/firstName/, $/lastName/, $/email/, $/salt/, $/password/, $/phoneNumber/, $/aptCode/, $/color/)', {
    firstName,
    lastName,
    email,
    salt,
    password,
    phoneNumber,
    aptCode,
    color
  }));
}

/**
 * gets app apartment costs for apartment group with given id
 * @param {string} id id of apartment group
 */
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

/**
 * adds a cost to apartment group with given id
 * @param {string} id id of apartment group
 * @param {string} name name of cost
 * @param {number} cost total monthly cost
 * @param {Array<string>} contributors array of user emails that are contributing to payment
 */
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

/**
 * edits a cost for apartment group with given id
 * @param {string} id id of apartment group
 * @param {string} name name of cost
 * @param {number} cost total monthly cost
 * @param {Array<string>} contributors array of user emails that are contributing to payment
 * @param {Array<string>} contributorsAdded array of user emails added since last time
 * @param {Array<string>} contributorsDropped array of user emails dropped since last time
 */
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

/**
 * removes a cost for apartment group with given id
 * @param {string} id id of apartment group
 * @param {string} name name of cost
 */
async function removeAptCost(id, name) {

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

/**
 * gets all apt codes
 */
async function getAptCodes() {
  return await connectAndRun(db => db.any('SELECT id FROM Apartment'));
}

/**
 * gets all users in apartment group with given id
 * @param {string} id id of apartment group
 */
async function getUsersInApt(id) {
  return await connectAndRun(db => db.any('SELECT firstName, email, AptId, color FROM UserProfile WHERE AptId = $/id/', {
    id: id,
  }));
}

/**
 * creates a new apartment in database with given newly generated id
 * @param {string} id id of apartment group
 * @param {string} rent rent of apartment group
 */
async function addAptCode(id, rent) {
  await connectAndRun(db => db.none('INSERT INTO Apartment VALUES($/id/, $/rent/, $/numMembers/)', {
    id: id,
    rent: rent,
    numMembers: 1,
  }))
  return;
}

async function assignAptId(email, id) {
  await connectAndRun(db => db.none('UPDATE UserProfile SET AptId = $/id/ WHERE email = $/email/', {
    id: id,
    email: email,
  }));
  return
}

async function getUserInfo(email) {
  let userInfo = await connectAndRun(db => db.any('SELECT firstName, lastName, email, AptId, color FROM UserProfile WHERE email = $/email/', {
    email: email,
  }));
  return userInfo;
}

app.get('/', (req, res) => {
  res.sendFile('index.html');
  res.end();
});

//Returns a user's payment data for a specific bill
app.get('/payments/:type', async (req, res) => {
  const id = req.session.currentUser.aptid
  res.json(await connectAndRun(db => db.any('SELECT * FROM UserPayments WHERE aptid = $/id/ AND billname = $/type/', { id, type : req.params.type })));
  res.end();
});

//Returns a bill's monthly cost
app.get('/cost/:type', async (req, res) => {
  const id = req.session.currentUser.aptid
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

// 	Returns a user's name given their email
app.get('/name/:email', async (req, res) => {
  res.json(await getFirstNameByEmail(req.params.email));
  res.end();
})

//Adds a payment to a specific bill
app.post('/addPayment', async (req, res) => {
  const {email, amount, billname, billtype} = req.body;
  const aptid = req.session.currentUser.aptid;
  const name = await getFirstNameByEmail(email);
  await connectAndRun(db => db.none('INSERT INTO UserPayments VALUES($/email/, $/name/, $/aptid/, $/billname/, $/amount/, $/billtype/)', { email, name, aptid, billname, amount, billtype }));
  res.end();
});

//Returns the percentage share of a user (assuming equal portions)
app.get('/share/:email', async (req, res) => {
  const id = await getUserAptId(req.params.email);
  const { nummembers } = await connectAndRun(db => db.one('SELECT NumMembers FROM Apartment WHERE id = $/id/', { id }));
  res.json(100 / nummembers);
  res.end();
});

// Returns a user's grocery budget
app.get('/budget/:email', async (req, res) => {
  const email = req.params.email;
  const { grocerybudget } = await connectAndRun(db => db.one('SELECT GroceryBudget FROM UserGroceryBill WHERE email = $/email/', { email }));
  res.json(grocerybudget / 100);
  res.end();
});

//Returns how much a user has spent on groceries
app.get('/bill/:email', async (req, res) => {
  const email = req.params.email;
  const { spent } = await connectAndRun(db => db.one('SELECT Spent FROM UserGroceryBill WHERE email = $/email/', { email }));
  res.json(spent / 100);
  res.end();
});

//Adds an amount spent to the user's grocery bill.
app.put('/addBill', async (req, res) => {
  const {email, amount} = req.body;
  await connectAndRun(db => db.none('UPDATE UserGroceryBill SET Spent = Spent + $/amount/ WHERE email = $/email/', { email, amount }));
  res.end();
});

//Returns a list of groceries for the apartment
app.get('/groceries', async (req, res) => {
  res.json(await getGroceries(req.session.currentUser));
  res.end();
});

//Returns a list of the apartment's inventory
app.get('/inventory', async (req, res) => {
  res.json(await getInventory(req.session.currentUser));
  res.end();
});

//Adds a new grocery item to the apartment's grocery list.
app.post('/addGrocery', async (req, res) => {
  const groceries = await getGroceries(req.session.currentUser);
  const aptid = req.session.currentUser.aptid
  const id = groceries.length;
  const {name, amount, requestedBy} = req.body;
  await connectAndRun(db => db.none('INSERT INTO Groceries VALUES($/aptid/, $/id/, $/name/, $/amount/, $/requestedBy/)', {aptid, id, name, amount, requestedBy}));
  res.end();
});

//Adds a new inventory item to the apartment's inventory list.
app.post('/addInventory', async (req, res) => {
  const inventory = await getInventory(req.session.currentUser);
  const aptid = req.session.currentUser.aptid
  const id = inventory.length;
  const {name, amount, requestedBy} = req.body;
  await connectAndRun(db => db.none('INSERT INTO Inventory VALUES($/aptid/, $/id/, $/name/, $/amount/, $/requestedBy/)', {aptid, id, name, amount, requestedBy}));
  res.end();
});

//Updates a grocery item (name or amount)
app.put('/editGrocery', async (req, res) => {
  const {id, name, amount} = req.body;
  await connectAndRun(db => db.none('UPDATE Groceries SET Name = $/name/, Amount = $/amount/ WHERE id = $/id/', { id, name, amount }));
  res.end();
});

//Updates an inventory item (name or amount)
app.put('/editInventory', async (req, res) => {
  const {id, name, amount} = req.body;
  await connectAndRun(db => db.none('UPDATE Inventory SET Name = $/name/, Amount = $/amount/ WHERE id = $/id/', { id, name, amount }));
  res.end();
});

//Removes a grocery item from apartment grocery list
app.delete('/removeGrocery/:id', async (req, res) => {
  await connectAndRun(db => db.none('DELETE FROM Groceries WHERE id = $/id/', { id: req.params.id }));
  res.end();
});

//Removes an inventory item from apartment inventory list
app.delete('/removeInventory/:id', async (req, res) => {
  await connectAndRun(db => db.none('DELETE FROM Inventory WHERE id = $/id/', { id: req.params.id }));
  res.end();
});

// Returns a list of the apartment's costs
app.get('/aptCosts/:id', async (req, res) => {
  const costs = await getAptCosts(req.params.id);
  res.json(costs);
  res.end();
});

// Adds a new apartment cost
app.post('/addAptCost', async (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', async () => {
    const element = JSON.parse(body);
    await addAptCosts(element.id, element.name, element.cost, element.contributors);
  });
  res.end();
});

// Edits the name/cost/contributers for a cost
app.put('/editAptCost', async (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', async () => {
    const element = JSON.parse(body);
    await editAptCosts(element.id, element.name, element.cost, element.contributors, element.contributorsAdded, element.contributorsDropped);
  });
  res.end();
});

// Deletes a cost from the apartment
app.delete('/removeAptCost', async (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', async () => {
    const element = JSON.parse(body);
    await removeAptCost(element.id, element.name);
  });
  res.end();
});

// Returns all apt ids
app.get('/allAptCodes', async (req, res) => {
  res.send(await getAptCodes());
  res.end();
});

// Returns the user data for all users in the apartment
app.get('/allUsersInApt/:id', async (req, res) => {
  res.send(await getUsersInApt(req.params.id));
  res.end();
});

// Adds the starting apartment information
app.post('/createApartment', async (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', async () => {
    const element = JSON.parse(body);
    await addAptCode(element.id, element.rent);
  });
  res.end();
});

// Adds aptid to userprofile data
app.post('/assignAptId', async (req, res) => {
  let body = '';
  req.on('data', data => body += data);
  req.on('end', async () => {
    const element = JSON.parse(body);
    await assignAptId(element.email, element.id);
  });
  res.end();
});

// Retrieves user info with given email
app.get('/userInfo', (req, res) => {
  res.send(req.session.currentUser);
  res.end();
});

// Returns a list of all user profiles
app.get('/profiles', async (req, res) => {
  res.json(await connectAndRun(db => db.any('SELECT * FROM UserProfile', [])));
  res.end();
})

//Gets the password of a user profile given an email
app.get('/loginProfile/:email/pass/:password', async (req, res) => {
  const email = req.params.email;
  const password = req.params.password;
  let pwlist = await connectAndRun(db => db.any('SELECT salt, password from UserProfile WHERE email = $/email/',{email:email}));
  let isValid = mc.check(password, pwlist[0].salt, pwlist[0].password);
  if(isValid) {
    req.session.currentUser = await connectAndRun(db => db.one('SELECT firstName, lastName, email, aptid, color FROM UserProfile WHERE email = $/email/', { email }));
    res.json(("true"));
  }
  else 
    res.json(("false"));
  res.end();
});

//Checks if a users email exists in the database, returns true if it's unique, false otherwise
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

app.post('/userProfile', async (req, res) => {
  let {fname, lname, email, password, phoneNumber, aptCode, color} = req.body;
  let userCrypt = mc.hash(password);
  let userSalt = userCrypt[0];
  let hash = userCrypt[1];
  password = hash;
  addUserProfile(fname, lname, email, userSalt, password, phoneNumber, aptCode, color);
  req.session.currentUser = { firstname: fname, lastname: lname, email, aptid: aptCode, color }
  res.end();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});