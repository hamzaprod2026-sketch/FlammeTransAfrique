/**
 * FLAMME TRANS D'AFRIQUE - SCRIPT PRINCIPAL
 * Interactions, navigation, carte réseau et validation du formulaire de devis
 */

document.addEventListener("DOMContentLoaded", () => {
  const mobileToggle = document.getElementById("mobileToggle");
  const navMenu = document.getElementById("navMenu");
  const dropdowns = document.querySelectorAll(".nav-dropdown");

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      const isExpanded = mobileToggle.getAttribute("aria-expanded") === "true";
      mobileToggle.setAttribute("aria-expanded", String(!isExpanded));
      navMenu.classList.toggle("active");
    });
  }

  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector(".nav-link");
    if (trigger) {
      trigger.addEventListener("click", (e) => {
        if (window.innerWidth <= 860) {
          e.preventDefault();
          dropdown.classList.toggle("open");
        }
      });
    }
  });

  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealElements.length > 0) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add("visible"));
  }

  const zoneButtons = document.querySelectorAll(".zone-btn");
  const zoneTitle = document.getElementById("zoneTitle");
  const zoneDesc = document.getElementById("zoneDesc");
  const zoneScope = document.getElementById("zoneScope");

  const zoneData = {
    national: {
      title: "Couverture Nationale & Corridors Intérieurs",
      desc: "Organisation des flux routiers domestiques entre zones industrielles, plateformes logistiques et centres de distribution.",
      scope: "Périmètre détaillé des villes et axes nationaux : [À confirmer par Flamme Trans d'Afrique]"
    },
    regional: {
      title: "Corridors Régionaux & Transfrontaliers Africains",
      desc: "Liaisons terrestres et opérations de transit transfrontalier reliant les marchés africains et les ports de commerce.",
      scope: "Pays et corridors africains desservis : [À confirmer par Flamme Trans d'Afrique]"
    },
    international: {
      title: "Connexions Maritimes & Aériennes Internationales",
      desc: "Coordination des expéditions internationales import/export, opérations portuaires, consignation et fret multimodal.",
      scope: "Ports et hubs internationaux partenaires : [À confirmer par Flamme Trans d'Afrique]"
    }
  };

  if (zoneButtons.length > 0 && zoneTitle && zoneDesc && zoneScope) {
    zoneButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        zoneButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const key = btn.getAttribute("data-zone");
        if (zoneData[key]) {
          zoneTitle.textContent = zoneData[key].title;
          zoneDesc.textContent = zoneData[key].desc;
          zoneScope.textContent = zoneData[key].scope;
        }
      });
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const preselectedService = urlParams.get("service");
  const serviceSelect = document.getElementById("prestation");
  if (preselectedService && serviceSelect) {
    const optionExists = Array.from(serviceSelect.options).some(
      (opt) => opt.value === preselectedService
    );
    if (optionExists) {
      serviceSelect.value = preselectedService;
    }
  }

  const quoteForm = document.getElementById("quoteForm");
  const formFeedback = document.getElementById("formFeedback");

  if (quoteForm) {
    quoteForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      let isValid = true;

      const formGroups = quoteForm.querySelectorAll(".form-group");
      formGroups.forEach((group) => {
        group.classList.remove("has-error");
        const input = group.querySelector(".form-control");
        if (input) input.classList.remove("is-invalid");
      });

      const requiredFields = quoteForm.querySelectorAll("[required]");
      requiredFields.forEach((field) => {
        const value = field.value.trim();
        const group = field.closest(".form-group");
        let fieldValid = true;

        if (!value) {
          fieldValid = false;
        } else if (field.type === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) fieldValid = false;
        } else if (field.type === "tel") {
          const phoneRegex = /^[+]?[\d\s().-]{7,20}$/;
          if (!phoneRegex.test(value)) fieldValid = false;
        }

        if (!fieldValid) {
          isValid = false;
          field.classList.add("is-invalid");
          if (group) group.classList.add("has-error");
        }
      });

      if (!isValid) {
        if (formFeedback) {
          formFeedback.className = "form-feedback error";
          formFeedback.innerHTML =
            "<strong>Vérification requise :</strong> Veuillez renseigner correctement tous les champs obligatoires marqués d'un astérisque (*).";
          formFeedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        return;
      }

      const formData = new FormData(quoteForm);
      const payload = Object.fromEntries(formData.entries());
      payload.submittedAt = new Date().toISOString();

      const submitBtn = quoteForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Traitement de votre demande...";

      try {
        /**
         * POINT D'INTÉGRATION API / EMAIL :
         * const response = await fetch("https://api.flammetrans.com/v1/quotes", {
         *   method: "POST",
         *   headers: { "Content-Type": "application/json" },
         *   body: JSON.stringify(payload)
         * });
         * if (!response.ok) throw new Error("Erreur serveur");
         */
        await new Promise((resolve) => setTimeout(resolve, 600));

        if (formFeedback) {
          formFeedback.className = "form-feedback success";
          formFeedback.innerHTML = `
            <strong>Votre demande de devis a bien été enregistrée.</strong><br>
            Merci <strong>${escapeHTML(payload.fullName)}</strong>. Votre dossier concernant une prestation de 
            <strong>${escapeHTML(payload.prestation)}</strong> (${escapeHTML(payload.departVille)}, ${escapeHTML(payload.departPays)} → ${escapeHTML(payload.destVille)}, ${escapeHTML(payload.destPays)}) 
            est prêt à être traité par l'équipe commerciale de <strong>Flamme Trans d'Afrique</strong>.
          `;
          formFeedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        quoteForm.reset();
      } catch (err) {
        if (formFeedback) {
          formFeedback.className = "form-feedback error";
          formFeedback.innerHTML =
            "<strong>Erreur technique :</strong> Impossible d'envoyer la demande pour le moment. Veuillez réessayer ultérieurement.";
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  }
});

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}