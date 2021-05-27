const dismissBtn = document.querySelector('.flash__message-dismiss');
const flash = document.querySelector('.flash');

const removeMessage = () => {
    flash.classList.add('remove');
}

dismissBtn.addEventListener('click', removeMessage);