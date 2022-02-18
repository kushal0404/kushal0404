# Inherit Chain

## Main File - route.cjs
This file contains all of the driver code for the server. It initializes the express server. The current working of this file is to demonstrate sending and retrieval of data from the MongoDB database in AWS Cloud. This file has the following flow:
1. Takes user info
2. Creates a user (lawyer or client) solana wallet (or account)
3. Stores the user data in database called sample-db inside account-data collection
4. Retrieves the user data from database
5. Prints the data on home screen

This file also includes code for encryption, decryption, hashing, and some more supporting snippets. These code snippets will soon be broken down into separate modules for encryption, hashing, and miscellaneous (Just like mongo.cjs).

## Database Operations - ./src/js/mongo.cjs
This file contains all of the code required for the application to communicate with MongoDB. It has 2 working functions, insertAccount(obj) and findAccount(qry) which are used to store and retrieve account details from database.
1. insertAccount(obj) takes a JSON object as input. This object is expected to contain all of the user data with the pre-decided nomenclature.
2. findAccount(qry) takes a query object. This JSON object must include the search criteria as required by the MongoDB norms.
