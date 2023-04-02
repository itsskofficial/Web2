export function setupPageFunctionality() {
  document.getElementById('hamburger-close').onclick = overlayHandler.bind(this)
  document.getElementById('hamburger-open').onclick = overlayHandler.bind(this)

  document.getElementById('home').onclick = overlayHandler.bind(this)
  document.getElementById('privacy').onclick = overlayHandler.bind(this)
}

//Navbar
let toggleStatus = true

function overlayHandler() {
  const overlayElement = document.getElementById('menu-overlay')

  if (toggleStatus) {
    overlayElement.classList.remove('passion__navbar-mobileScreen-overlayClose')
    overlayElement.classList.add('passion__navbar-mobileScreen-overlayOpen')
    toggleStatus = false
  } else {
    overlayElement.classList.remove('passion__navbar-mobileScreen-overlayOpen')
    overlayElement.classList.add('passion__navbar-mobileScreen-overlayClose')
    toggleStatus = true
  }
}
