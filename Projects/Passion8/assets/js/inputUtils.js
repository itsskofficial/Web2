const firebaseConfig = {
  apiKey: 'AIzaSyCRE1IqEmbBYEKm1viuilF1cTmaQYmt198',
  authDomain: 'passion8-app.firebaseapp.com',
  databaseURL: 'https://passion8-app-default-rtdb.firebaseio.com',
  projectId: 'passion8-app',
  storageBucket: 'passion8-app.appspot.com',
  messagingSenderId: '727922558608',
  appId: '1:727922558608:web:1cd131d0bd1da784b03a15',
  measurementId: 'G-CQYZJG76BN'
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

// reference the database
const emailFormDB = firebase.database().ref('emailForm')

document.getElementById('emailinputform').addEventListener('submit', submitForm)

function submitForm(e) {
  e.preventDefault()

  // get values
  const email = document.getElementById('email').value

  saveEmails(email)

  // add alert
  document.querySelector('.alertbox').style.display = 'flex'

  // remove alert
  setTimeout(() => {
    document.querySelector('.alertbox').style.display = 'none'
  }, 3000)

  // reset the input field
  document.getElementById('emailinputform').reset()
}

function saveEmails(email) {
  let newEmailForm = emailFormDB.push()
  newEmailForm.set({
    email: email
  })
}
