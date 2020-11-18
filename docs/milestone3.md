**Data Model**

Our web page has six major components: User Profiles, User Bills, Apartment, Bills, Costs, Groceries, and Inventory. 

*  User profiles contain each user's personal information including the  initial setup data as well as the progress on their payments. 
    *  Each field is an input field on the Sign Up Page

*  User Bills contains all the bills and payments a user has or has made as well as their budget
    *  grocerybudget is how much ($) that user can spend on groceries
    *  rentoewed is the proportion of rent in dollars the user owes
    *  rentpaid is how much of the user paid as a %
    *  numbills is the total number of bills a user pays
    *  outstanding is the total of a users outstanding payments

*  Apartment contains all the information about a group's apartment as defined in the apartment creation page. 
    *  Apartment code is the apartment identifier
    *  Rent is the total rent of the apartment
    *  nummembers is how many people live in the apartment

*  Bills is a table where each entry is a defined bill shared by the apartment (electric, wifi, etc). 
    *  billname is the name of the bill
    *  cost is the total cost of the bill
    *  nummembers is how many people are paying the bill

*  Costs is a table showing how much of each bill each user pays. 
    *  Apartment code is the primary key to identify which apartment the bill is for
    *  billname is a foreign key referencing the bill table for each bill in the apartment
    *  proportionpaidd$ is measuring how much of the bill is paid in dollars
    *  proportionpaid% is measuring how much of the bill is paid as a percentage
    *  progress is a percetage measuring how much of the total bill is paid

*  Groceries contains the list of groceries bought/needed for an apartment. 
    *  Apartment code is the primary key to identify which apartment the grocery list is for
    *  name is the name of the grocery item
    *  quantity is the amout of that item
    *  requestedby is the first name of whoever requested the item

*  Inventory is a table the contains all the grocieries/goods that are in the apartment (have been bought). 
    *  Apartment code is the primary key to identify which apartment the grocery list is for
    *  name is the name of the item added to inventory
    *  quantitiy is the amount of that item that was bought
    *  boughtby is the name of whoever bought the item
    *  cost is how much the item cost

![Data Model](images/data_model.png)

## Division of Labor

Bryce worked on 

Leon worked on 

Hannah worked on 