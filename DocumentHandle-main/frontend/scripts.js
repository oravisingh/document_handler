document.querySelectorAll("a.tool").forEach(link => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(".page-transition").style.animation = "slideOutToBottom 0.4s ease-in forwards";

    setTimeout(() => {
      window.location.href = this.href;
    }, 400);
  });
});
