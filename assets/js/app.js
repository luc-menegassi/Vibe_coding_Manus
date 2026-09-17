(function ( ) {
  "use strict";

  const menuButton = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");

  if (menuButton && menu) {
    menuButton.addEventListener("click", function () {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";

      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menu.classList.toggle("is-open", !isOpen);
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menuButton.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
      });
    });
  }

  const currentPage = window.location.pathname.split("/").pop();

  document.querySelectorAll(".main-navigation a").forEach(function (link) {
    const linkPage = link.getAttribute("href").split("/").pop();

    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });

  document.querySelectorAll("[data-copy]").forEach(function (button) {
    button.addEventListener("click", async function () {
      const targetSelector = button.getAttribute("data-copy");
      const target = document.querySelector(targetSelector);

      if (!target) {
        return;
      }

      try {
        await navigator.clipboard.writeText(target.textContent.trim());

        const originalText = button.textContent;
        button.textContent = "Copiado";

        setTimeout(function () {
          button.textContent = originalText;
        }, 1600);
      } catch (error) {
        button.textContent = "Não foi possível copiar";

        setTimeout(function () {
          button.textContent = "Copiar";
        }, 1600);
      }
    });
  });

  document.querySelectorAll("[data-checklist]").forEach(function (checkbox) {
    const key = "vibe-coding-checklist-" + checkbox.id;
    const savedValue = window.localStorage.getItem(key);

    checkbox.checked = savedValue === "true";

    checkbox.addEventListener("change", function () {
      window.localStorage.setItem(key, String(checkbox.checked));
    });
  });
})();
