// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCBISNTV8Q5tYtc_pX2KsFoCz4sPxrL3yI",
  authDomain: "zkengage.firebaseapp.com",
  databaseURL: "https://zkengage-default-rtdb.firebaseio.com",
  projectId: "zkengage",
  storageBucket: "zkengage.firebasestorage.app",
  messagingSenderId: "650997000615",
  appId: "1:650997000615:web:849962c77267bbe216ee82",
  measurementId: "G-NR1TWX0WDE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);