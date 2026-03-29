mw.hook('wikipage.content').add(function () {
  const popup = document.getElementById("bk-event-popup");
  const btn = document.getElementById("bk-popup-close");

  if (!popup || !btn) return;

  const eventId = popup.dataset.event || "default_event";

  if (localStorage.getItem("bk_event_" + eventId)) {
    popup.style.display = "none";
    return;
  }

  btn.onclick = function () {
    popup.classList.add("fade-out");

    localStorage.setItem("bk_event_" + eventId, "seen");

    setTimeout(() => {
      popup.style.display = "none";
    }, 400);
  };
});
