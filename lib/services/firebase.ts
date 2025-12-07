import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAMItDFEjajieYjw7w0GyFCDqofJxDqBbI',
  authDomain: 'tifto-customer.firebaseapp.com',
  projectId: 'tifto-customer',
  storageBucket: 'tifto-customer.firebasestorage.app',
  messagingSenderId: '765681810225',
  appId: '1:765681810225:web:4a84cc5b6bfabbf80d8e10',
  measurementId: 'G-7WKMYV8WH4',
};

const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const firebaseAuth = getAuth(firebaseApp);

export { firebaseApp, firebaseAuth };

