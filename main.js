
const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN"; // например "123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
const TELEGRAM_CHAT_ID   = "YOUR_CHAT_ID";   // например "123456789"

async function sendToTelegram(text){
  if (TELEGRAM_BOT_TOKEN === "YOUR_BOT_TOKEN" || TELEGRAM_CHAT_ID === "YOUR_CHAT_ID") {
    console.warn("Telegram не настроен: укажите TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в js/main.js");
    return { ok:false, offline:true };
  }
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try{
    const res = await fetch(url, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode:"HTML" })
    });
    const data = await res.json();
    return { ok: data.ok };
  }catch(err){
    console.error(err);
    return { ok:false };
  }
}

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Pre-fill course select from ?course= query param ---------- */
  const courseParam = new URLSearchParams(window.location.search).get("course");
  const courseSelect = document.querySelector("#enroll-course");
  if (courseParam && courseSelect){
    const match = [...courseSelect.options].find(o => o.value === courseParam);
    if (match) courseSelect.value = match.value;
  }

  /* ---------- Header scroll state ---------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    if (header) header.style.borderBottomColor = window.scrollY > 20 ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.06)";
    toggleBackToTop();
  };
  window.addEventListener("scroll", onScroll, { passive:true });

  /* ---------- Burger / mobile nav ---------- */
  const burger = document.querySelector(".burger");
  const mobileNav = document.querySelector(".mobile-nav");
  if (burger && mobileNav){
    burger.addEventListener("click", () => {
      burger.classList.toggle("is-active");
      mobileNav.classList.toggle("is-open");
      document.body.style.overflow = mobileNav.classList.contains("is-open") ? "hidden" : "";
    });
    mobileNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        burger.classList.remove("is-active");
        mobileNav.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Smooth scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      if (id.length > 1){
        const target = document.querySelector(id);
        if (target){
          e.preventDefault();
          target.scrollIntoView({ behavior:"smooth", block:"start" });
        }
      }
    });
  });

  /* ---------- Back to top ---------- */
  const toTop = document.querySelector(".to-top");
  function toggleBackToTop(){
    if (!toTop) return;
    toTop.classList.toggle("is-visible", window.scrollY > 480);
  }
  if (toTop){
    toTop.addEventListener("click", () => window.scrollTo({ top:0, behavior:"smooth" }));
  }
  toggleBackToTop();

  /* ---------- Reveal on scroll ---------- */
  const animated = document.querySelectorAll("[data-animate]");
  if ("IntersectionObserver" in window && animated.length){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold:.15 });
    animated.forEach(el => io.observe(el));
  } else {
    animated.forEach(el => el.classList.add("in-view"));
  }

  /* ---------- Testimonial slider ---------- */
  const slider = document.querySelector(".slider");
  if (slider){
    const track = slider.querySelector(".slider-slides");
    const slides = slider.querySelectorAll(".slide");
    const dotsWrap = slider.querySelector(".slider-dots");
    let index = 0;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "slider-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", `Отзыв ${i+1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = dotsWrap.querySelectorAll(".slider-dot");

    function goTo(i){
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle("active", di === index));
    }
    slider.querySelector(".slider-arrow.prev")?.addEventListener("click", () => goTo(index - 1));
    slider.querySelector(".slider-arrow.next")?.addEventListener("click", () => goTo(index + 1));

    let auto = setInterval(() => goTo(index + 1), 6000);
    slider.addEventListener("mouseenter", () => clearInterval(auto));
    slider.addEventListener("mouseleave", () => auto = setInterval(() => goTo(index + 1), 6000));
  }

  /* ---------- Course filter chips ---------- */
  const chips = document.querySelectorAll(".filter-chip");
  const courseCards = document.querySelectorAll("[data-category]");
  if (chips.length){
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        chips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        const cat = chip.dataset.filter;
        courseCards.forEach(card => {
          const show = cat === "all" || card.dataset.category === cat;
          card.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* ---------- Course modal ---------- */
  const modalOverlay = document.querySelector(".modal-overlay");
  if (modalOverlay){
    const modalBody = modalOverlay.querySelector(".modal-body");
    document.querySelectorAll("[data-course-detail]").forEach(btn => {
      btn.addEventListener("click", () => {
        modalBody.innerHTML = `
          <h3 style="font-size:24px;margin-bottom:14px;">${btn.dataset.title}</h3>
          <p style="color:var(--ink-300);margin-bottom:18px;">${btn.dataset.desc}</p>
          <div style="display:flex;gap:24px;margin-bottom:24px;flex-wrap:wrap;">
            <div><span style="color:var(--ink-500);font-size:13px;display:block;">Длительность</span><strong>${btn.dataset.duration}</strong></div>
            <div><span style="color:var(--ink-500);font-size:13px;display:block;">Стоимость</span><strong style="color:var(--amber-400);">${btn.dataset.price}</strong></div>
          </div>
          <a href="contacts.html?course=${encodeURIComponent(btn.dataset.title)}#enroll-form" class="btn btn-primary btn-block modal-enroll">Записаться на курс</a>
        `;
        openModal();
      });
    });
    function openModal(){ modalOverlay.classList.add("is-open"); document.body.style.overflow = "hidden"; }
    function closeModal(){ modalOverlay.classList.remove("is-open"); document.body.style.overflow = ""; }
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay || e.target.classList.contains("modal-close")) closeModal();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  }

  /* ---------- Forms: validation + Telegram ---------- */
  function validateField(field){
    const input = field.querySelector("input, textarea, select");
    if (!input) return true;
    let valid = true;

    if (input.hasAttribute("required") && !input.value.trim()){
      valid = false;
    }
    if (valid && input.type === "email" && input.value.trim()){
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
    }
    if (valid && input.type === "tel" && input.value.trim()){
      valid = /^[\d+()\s-]{7,}$/.test(input.value.trim());
    }
    if (valid && input.dataset.minlength && input.value.trim().length < Number(input.dataset.minlength)){
      valid = false;
    }
    field.classList.toggle("has-error", !valid);
    return valid;
  }

  document.querySelectorAll("form[data-telegram-form]").forEach(form => {
    const fields = form.querySelectorAll(".field");
    fields.forEach(field => {
      const input = field.querySelector("input, textarea, select");
      input?.addEventListener("blur", () => validateField(field));
      input?.addEventListener("input", () => { if (field.classList.contains("has-error")) validateField(field); });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let allValid = true;
      fields.forEach(field => { if (!validateField(field)) allValid = false; });

      const statusEl = form.querySelector(".form-status");
      if (!allValid){
        if (statusEl){
          statusEl.textContent = "Пожалуйста, заполните обязательные поля корректно.";
          statusEl.className = "form-status error";
        }
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : "";
      if (submitBtn){ submitBtn.textContent = "Отправляем..."; submitBtn.disabled = true; }

      const data = new FormData(form);
      const lines = [`<b>Новая заявка — ${form.dataset.telegramForm || "Nur IT"}</b>`];
      data.forEach((value, key) => {
        if (value) lines.push(`<b>${key}:</b> ${String(value).replace(/</g,"&lt;")}`);
      });

      const result = await sendToTelegram(lines.join("\n"));

      if (submitBtn){ submitBtn.textContent = originalText; submitBtn.disabled = false; }

      if (statusEl){
        if (result.ok){
          statusEl.textContent = "Спасибо! Заявка отправлена, мы свяжемся с вами в ближайшее время.";
          statusEl.className = "form-status success";
          form.reset();
        } else if (result.offline){
          statusEl.textContent = "Заявка принята локально (для отправки в Telegram настройте бота в js/main.js).";
          statusEl.className = "form-status success";
          form.reset();
        } else {
          statusEl.textContent = "Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.";
          statusEl.className = "form-status error";
        }
      }
    });
  });

});
