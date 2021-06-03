const modalEl=document.querySelector(".modal");
const modalImg=document.querySelector(".modal__img");
Array.from(document.querySelectorAll(".img")).forEach(img => {
    img.addEventListener("click", event => {
        modalEl.style.display="block";
        modalImg.src=event.target.src;

    });
});

document.querySelector(".modal__close").addEventListener("click", () => {
    modalEl.style.display="none";
});

window.onclick=function (event) {
    if (event.target==modalEl) {
        modalEl.style.display="none";
    }
}