//create variable to hold bd connection
let db;

//establish a connection to IndexedDB database called 'budget' and set it to version 1

const request = indexedDB.open('budget', 1);


request.onupgradeneeded = function(event) {
    //save a ref to the database
    const db = event.target.result;
    //create an object store called 'new-transaction', set it to have an auto incrementing primary key of sorts
    db.createObjectStore('new_transaction', { autoIncrement: true }); 
};


