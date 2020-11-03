# Milestone 2: Front-end JavaScript

## Part 0

Our web page has five major components: User Profiles, Apartment, Bills, Groceries, and Inventory. 

User profiles contain each user's personal information including the initial setup data as well as the progress on their payments. Each User has fields containing data for their: First name, last name, email, password, phone number, reminder emails, reminder texts, user icon, apartment code and outstanding payments. The primary key for this table would be a user's email as it must be non-null and unique. This table has foreign keys: apartment code referencing the apartment table and outstanding payments referencing the bill table.

Apartments contains all the information about a group's apartment as defined in the apartment creation page. Each apartment has fields containing the apartment code, total rent per month, number of members in each apartment, split of how much each member owes per month as a percentage (default is evenly split), and a list of all other apartment bills. The primary key of this table is the apartment code (serves as an ID). This table has a foreign key that is the list of bills referencecing the Bill table.

Bills is a table where each entry is a defined bill shared by the apartment (electric, wifi, etc). Each entry has the fields: Bill name,total bill cost per month, number of apartment members who contribute to the bill (default is all), and split of how much each member pays to it per month (default is even split), and progress on the bill. The primary key is the bill name. There are foreign keys connecting how much each member pays to the user profile table.

Groceries contains the list of groceries bought/needed for an apartment. Each entry in the table contains the food name, quantity, and which user requested it. The primary key is the food name and there is a foreign key from the user who requested it referencing the User profiles table.

Inventory is a table the contains all the grocieries/goods that are in the apartment (have been bought). Inventory has fields: food name which is the name of the food or item, quantity of item, which user it was bought by and how much they spent on it. The primary key here is the name. There's foreign keys from the user who bought it referencing the User profiles table and from the food name referencing the food name on the grocery list (to track when requested items are bought).

## Part 2

TODO: CRUD operations descriptions and screenshots of client interface

## Part 3

TODO: Heroku link

## Division of Labor

Bryce worked on 

Leon worked on

Hannah worked on 