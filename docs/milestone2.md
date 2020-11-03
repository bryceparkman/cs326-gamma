# Milestone 2: Front-end JavaScript

## Part 0

Our web page has six major components: User Profiles, Apartment, Bills, Costs, Groceries, and Inventory. 

User profiles contain each user's personal information including the initial setup data as well as the progress on their payments. Each User has fields containing data for their: First name, last name, email, password, phone number, reminder emails, reminder texts, user icon, apartment code and outstanding payments. The primary key for this table would be a user's email as it must be non-null and unique. This table has foreign keys: apartment code referencing the apartment table and outstanding payments referencing the bill table.

Apartments contains all the information about a group's apartment as defined in the apartment creation page. Each apartment has fields containing the apartment code, total rent per month, number of members in each apartment, and if rent is evenly split. The primary key of this table is the apartment code (serves as an ID). 

Bills is a table where each entry is a defined bill shared by the apartment (electric, wifi, etc). Each entry has the fields: Bill name,total bill cost per month, number of apartment members who contribute to the bill (default is all), and progress on the bill. The primary key is the bill name. There are foreign keys connecting how much each member pays to the user profile table and the Costs table.

Costs is a table showing how much of each bill each user pays. The fields are apartment code, user's name, total bill cost, what % of bill they pay and how much they've paid. The primary key is the apartment code and there's foreign keys to the user profile table, apartment table, and bill table.

Groceries contains the list of groceries bought/needed for an apartment. Each entry in the table contains the food name, quantity, and which user requested it. The primary key is the food name.

Inventory is a table the contains all the grocieries/goods that are in the apartment (have been bought). Inventory has fields: food name which is the name of the food or item, quantity of item, which user it was bought by and how much they spent on it. The primary key here is the name. There's a foreign key from the food name referencing the food name on the grocery list (to track when requested items are bought).

![Data Model](images/data_model.png)

## Part 2

TODO: CRUD operations descriptions and screenshots of client interface

## Part 3

TODO: Heroku link

## Division of Labor

Bryce worked on 

Leon worked on

Hannah worked on 