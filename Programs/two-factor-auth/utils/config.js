import { initializeApp } from "firebase/app";
import "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyA8rwf4z7k8J7OcmsDjP-uHxRO1qM7P3NQ",
  authDomain: "twofactorauth-5471a.firebaseapp.com",
  projectId: "twofactorauth-5471a",
  storageBucket: "twofactorauth-5471a.appspot.com",
  messagingSenderId: "477944253310",
  appId: "1:477944253310:web:2f6c667e366caf493f412f",
  measurementId: "G-3284PCYZ0R"
};

const app = initializeApp(firebaseConfig);

export {app}