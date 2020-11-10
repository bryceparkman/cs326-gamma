# Milestone 2: Front-end JavaScript

## Part 0

**API Endpoints**

GET Requests: 

/loginProfile This request returns a user password for a username to verify a user on the login page. Input: username or email. Output: User password

/rentProgress This request gets the amount of rent a user has paid from the costs payed (progress) to be shown on the costs page. Output data: Dollar amount a user has paid 

/billProgress This request gets the amount any user has paid on a bill shown on the apartment overview page. Input data: name of bill, name of user. Output data: Dollar amount user has paid

/groceryItem This request goes from the grocery page to the grocery table. Output is all the data from the grocery table

/inventoryItem This request goes from the grocery page to the inventory table. Output is all the data from the inventory table


POST Requests:

/userProfile This request goes from the create user profile page to the user profile table. Input data: user name, email, and apartment code. Outputs a message saying successfully created user.

/apartmentProfile This request goes from the apartment creation page to the apartment table. Input data: apartment code, total rent, number of members. Outputs a message saying successfully created apt.

/newBill This request goes from the apartment creation page to the bills table. Input Data: Bill name, cost, and how many people are paying the bill. The output is the bill added to the apartment overview page.

/payment This request comes from the costs page to the costs table whenever a user makes a payment. Input data: payment amount, and output is the progress bar of the bill being updated. 


/newGroceryItem This request goes from the grocery page to the grocery table. Input data: name, and quantity. Output is the item added to the apartment's grocery list. 

/newInventoryItem This request goes from the grocery page to the inventory table. Input data: name, quantity, and cost. Output is the item added to the apartment's inventory list. 

**Data Model**

Our web page has six major components: User Profiles, Apartment, Bills, Costs, Groceries, and Inventory. 

*  User profiles contain each user's personal information including the  initial setup data as well as the progress on their payments. 
*  Apartments contains all the information about a group's apartment as defined in the apartment creation page. 
*  Bills is a table where each entry is a defined bill shared by the apartment (electric, wifi, etc). 
*  Costs is a table showing how much of each bill each user pays. 
*  Groceries contains the list of groceries bought/needed for an apartment. 
*  Inventory is a table the contains all the grocieries/goods that are in the apartment (have been bought). 

![Data Model](images/data_model.png)

## Part 2
Costs page

![Costs](images/costs.png)
The costs page uses create and read API endpoints. The 'Contribute Rent' button triggers a create endpoint to add the payment to the databases stored payments, and the read endpoints are used to get the total apartment costs and individual user contribution percentage.

Groceries page

![Groceries](images/groceries.png)
The groceries page implements the full CRUD API. The plus button creates a new item to the database of groceries / inventory respectively. The individual user budgets, groceries, and inventory implement a read api call. The edit function on the cards implements the update API, and the remove implements the delete API.

Signup page

![Signup](images/signup.png)
The Signup page uses a POST request (create) to post the new user data to the server as a profile entry. The new data contains a body with the {firstName, lastName, email, password, color, aptCode} when a new user is created. This image also shows some of the JS functionality making sure users enter the correct entries in required fields.

Login page

![Login](images/login.png)
The Login page uses a GET request (read) to verify that the user logging in is entering their password. It takes the users email as a paramater and then reads from the database and returns the correct password for that email. If the password matches what the user enters, it allows them to log in.

Apartment creation page

![Apartment creation](images/apartment-creation-2.0.png)
The apartment creation page uses POST requests to add data(name, cost, contribution percentages) about rent and different monthly apartment costs to the database

Apartment overview page

![Apartment overview](images/apartment-overview-2.0.png)
The apartment overview page uses the full crud API. The page uses a GET request to download data about an apartment groups monthly apartment costs. The button in the bottom right corner allows users to add new monthly costs to their apartment, and the edit and remove buttons on each utility allows users to change and remove data from the database.


## Part 3

TODO: Heroku link

## Division of Labor

Bryce worked on groceries.js, costs.js, and routes in server.js for these files.

Leon worked on apt-creation.js, apt-overview.js, and routes in server.js for these files.

Hannah worked on signup.js, login.js, and routes in server.js for these files as well as worked on the documentation in Part 0.
