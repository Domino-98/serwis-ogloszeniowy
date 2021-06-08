const dismissBtn = document.querySelector('.flash__message-dismiss');
const flash = document.querySelector('.flash');

const removeMessage = () => {
    flash.classList.add('remove');
}

if (dismissBtn) {
    dismissBtn.addEventListener('click', removeMessage);
}