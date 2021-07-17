const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;
//create variable to hold bd connection
let db;

//establish a connection to IndexedDB database called 'budget' and set it to version 1

const request = indexedDB.open('budget', 1);


request.onupgradeneeded = (event) => {
    //save a ref to the database
    let db = event.target.result;
    //create an object store called 'new-transaction', set it to have an auto incrementing primary key of sorts
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsucess = (event) => {
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
    const store = transaction.objectStore('new_transaction');

    // add record to your store with add method
    store.add(record);
}

function uploadTransaction() {
    // open a transaction on your db
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // access your object store
    const store = transaction.objectStore('new_transaction');

    // get all records from store and set to a variable
    const getAll = store.getAll();

    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function () {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(() => {
                    //delete the record from the indexDB if successful
                    const transaction = db.transaction(['new_transaction'], 'readwrite');

                    // access the object store for `new_transaction`
                    const store = transaction.objectStore('new_transaction');

                    // add record to your store with add method
                    store.clear();
                })
        }
    };
}

// listen for app coming back online
window.addEventListener('online', uploadTransaction);

