//create variable to hold bd connection
let db;

//establish a connection to IndexedDB database called 'budget' and set it to version 1

const request = indexedDB.open('budget', 1);


request.onupgradeneeded = function (event) {
    //save a ref to the database
    const db = event.target.result;
    //create an object store called 'new-transaction', set it to have an auto incrementing primary key of sorts
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsucess = function (event) {
    db = event.target.result;

    if (navigator.online) {
        uploadTransaction();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};


function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // access the object store for `new_transaction`
    const transactionObjectStore = transaction.objectStore('new_transaction');

    // add record to your store with add method
    transactionObjectStore.add(record);
}

function uploadTransaction() {
    // open a transaction on your db
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // access your object store
    const transactionObjectStore = transaction.objectStore('new_transaction');

    // get all records from store and set to a variable
    const getAll = transactionObjectStore.getAll();

    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function () {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // open one more transaction
                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    // access the new_pizza object store
                    const transactionObjectStore = transaction.objectStore('new_transaction');
                    // clear all items in your store
                    transactionObjectStore.clear();

                    alert('All saved transaction has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
}

// listen for app coming back online
window.addEventListener('online', uploadTransaction);

