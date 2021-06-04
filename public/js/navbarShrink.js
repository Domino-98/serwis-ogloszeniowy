const navbar = document.querySelector('.navbar');
const navbarLogoText = document.querySelector('.navbar__logo-text');
const navbarLogo = document.querySelector('.navbar__logo');
const navbarSearchInput = document.querySelector('.navbar__search-input');
const navBtns = document.getElementsByClassName('nav__link');

window.onscroll = function() {navbarShrink()};

const navbarShrink = () => {
     if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
      navbar.style.height = "7rem";
      navbarLogoText.style.fontSize = "4rem";
      navbarLogo.style.width = "4rem";
      navbarSearchInput.style.fontSize = "1.6rem";
      navbarSearchInput.style.padding = "1rem 2rem";
      for (let btn of navBtns) {
        btn.style.padding = "0.5rem 1.25rem";
      };
    } else {
      navbar.style.height = "9rem";
      navbarLogoText.style.fontSize = "5rem";
      navbarLogo.style.width = "5rem";
      navbarSearchInput.style.fontSize = "2rem";
      navbarSearchInput.style.padding = "1rem 2.5rem";
      for (let btn of navBtns) {
        btn.style.padding = "0.75rem 1.5rem";
      };
    }
}