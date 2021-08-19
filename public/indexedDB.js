let db;

const request = indexedDB.open('Budget', 1);

request.onupgradeneeded = event => {
  console.log('Upgrade needed');
  db = event.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore('transactions', { autoIncrement: true });
    console.log('Object Store created!')
  }
};

request.onsuccess = event => {
  console.log('Request successful!');
  db = event.target.result;

  if (navigator.onLine) {
    console.log('App Online!');
    checkDatabase();
  }
};

request.onerror = event => {
  console.log(`Request error: ${event.target.errorCode}`);
};

function checkDatabase() {

  let transaction = db.transaction(['transactions'], 'readwrite');
  const objectStore = transaction.objectStore('transactions');

  const getAll = objectStore.getAll();

  getAll.onsuccess = () => {

    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(response => {

          if (response.length !== 0) {

            transaction = db.transaction(['transactions'], 'readwrite');
            const currentStore = transaction.objectStore('transactions');

            currentStore.clear();
            console.log('IndexedDB cleared!');
          }
        });
    }
  };

  getAll.onerror = () => {
    console.log(`Request error: ${target.errorCode}`);
  };
}

const saveRecord = record => {

  const transaction = db.transaction(['transactions'], 'readwrite');
  const objectStore = transaction.objectStore('transactions');

  objectStore.add(record);
  console.log('Record Added!');
};

window.addEventListener('online', checkDatabase);