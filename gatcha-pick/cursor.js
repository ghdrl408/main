const customCursor = document.querySelector("#custom-cursor");

if (customCursor && !matchMedia("(hover: none), (pointer: coarse)").matches) {
  window.addEventListener("pointermove", event => {
    customCursor.style.transform = `translate3d(${event.clientX - 1}px, ${event.clientY - 1}px, 0)`;
    customCursor.classList.add("is-visible");
  }, { passive: true });

  window.addEventListener("blur", () => {
    customCursor.classList.remove("is-visible");
  });

  window.addEventListener("focus", () => {
    customCursor.classList.remove("is-visible");
  });
}
