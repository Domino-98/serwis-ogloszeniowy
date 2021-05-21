const navbar = document.querySelector('.navbar');
const navbarLogo = document.querySelector('.navbar__logo-text');
const navbarSearchInput = document.querySelector('.navbar__search-input');
const navBtns = document.getElementsByClassName('nav__link');

window.onscroll = function() {navbarShrink()};

const navbarShrink = () => {
     if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
      navbar.style.height = "7rem";
      navbarLogo.style.fontSize = "4rem";
      navbarSearchInput.style.fontSize = "1.6rem";
      navbarSearchInput.style.padding = "1rem 2rem";
      for (let btn of navBtns) {
        btn.style.padding = "0.5rem 2rem";
      };
    } else {
      navbar.style.height = "10rem";
      navbarLogo.style.fontSize = "5rem";
      navbarSearchInput.style.fontSize = "2rem";
      navbarSearchInput.style.padding = "1.25rem 2.5rem";
      for (let btn of navBtns) {
        btn.style.padding = "0.75rem 2.5rem";
      };
    }
}