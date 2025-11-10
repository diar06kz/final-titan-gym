document.addEventListener("DOMContentLoaded", () => {
  // ---- Keyboard Event Handling for Navbar Links ----
  const menuLinks = document.querySelectorAll('.navbar-nav .nav-link');
  if (menuLinks && menuLinks.length) {
    menuLinks.forEach(link => link.setAttribute('tabindex', '0'));
    let currentIndex = 0;
    if (menuLinks[currentIndex]) menuLinks[currentIndex].focus();

    document.addEventListener('keydown', (e) => {
      const key = e.key;
      if (key === 'ArrowRight' || key === 'ArrowDown') {
        e.preventDefault();
        currentIndex = (currentIndex + 1) % menuLinks.length;
        menuLinks[currentIndex].focus();
      } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
        e.preventDefault();
        currentIndex = (currentIndex - 1 + menuLinks.length) % menuLinks.length;
        menuLinks[currentIndex].focus();
      } else if (key === 'Enter') {
        e.preventDefault();
        const href = menuLinks[currentIndex] && menuLinks[currentIndex].href;
        if (href) window.location.href = href;
      }
    });
  }
  

  // ---- Dynamic Managers Cards ----
  const managers = [
    { name: "Anna Petrova", role: "Cardio Fitness Manager", phone: "+7 (777) 123-45-67", email: "anna.petrova@bloomgym.com" },
    { name: "Michael Kim", role: "Yoga Hall Manager", phone: "+7 (700) 987-65-43", email: "michael.kim@bloomgym.com" },
    { name: "Sofia Lee", role: "High Heels Dance Manager", phone: "+7 (701) 555-22-11", email: "sofia.lee@bloomgym.com" },
    { name: "David Brown", role: "Strength Training Manager", phone: "+7 (702) 444-33-22", email: "david.brown@bloomgym.com" }
  ];

  const managersGrid = document.querySelector(".managers-grid");
  if (managersGrid) {
    managersGrid.innerHTML = "";
    managers.forEach(manager => {
      console.log(`Manager: ${manager.name}`);
      const card = document.createElement("div");
      card.classList.add("contact-card");
      card.innerHTML = `
        <h3>${manager.name}</h3>
        <p>${manager.role}</p>
        <p>&#128222; ${manager.phone}</p>
        <p>&#128233; ${manager.email}</p>
        <button class="copy-btn">Copy</button>`;
      managersGrid.appendChild(card);
    });
  }

  // ---- Popup Form ----
  const openPopupBtn = document.getElementById("openPopup");
  const popup = document.getElementById("popupForm");
  const closeBtn = document.querySelector(".popup .close");

  if (openPopupBtn && popup) {
    openPopupBtn.addEventListener("click", () => popup.style.display = "flex");
  }
  if (closeBtn && popup) {
    closeBtn.addEventListener("click", () => popup.style.display = "none");
    window.addEventListener("click", (event) => {
      if (event.target === popup) popup.style.display = "none";
    });
  }

  // ---- FAQ Accordion ----
  const titles = document.querySelectorAll(".accordion-title");
  titles.forEach(title => {
    title.addEventListener("click", () => {
      const content = title.nextElementSibling;
      if (!content) return;

      document.querySelectorAll(".accordion-content").forEach(c => {
        if (c !== content) c.classList.remove("open");
      });
      content.classList.toggle("open");
      if (content.classList.contains("open")) {
        content.style.maxHeight = content.scrollHeight + "px";
      } else {
        content.style.maxHeight = null;
      }
    });
  });

  // ---- Date/Time Display ----
  function updateDateTime() {
    const dateTimeEl = document.getElementById('dateTime');
    if (!dateTimeEl) return;
    const now = new Date();
    const options = { 
      year:'numeric', month:'long', day:'numeric', 
      hour:'2-digit', minute:'2-digit', second:'2-digit', 
      hour12:true 
    };
    dateTimeEl.textContent = now.toLocaleString('en-US', options);
  }
  updateDateTime();
  setInterval(updateDateTime, 1000);

  // ---- Read More Section ----
  const readMoreButtons = document.querySelectorAll('.read-more-btn');
  readMoreButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.program-card');
      if (!card) return;
      const moreText = card.querySelector('.more-text');
      if (!moreText) return;

      if (moreText.style.display === 'block') {
        moreText.style.display = 'none';
        btn.textContent = 'Read More';
        moreText.style.color = "";
      } else {
        moreText.style.display = 'block';
        moreText.style.color = "#a32c2c";
        btn.textContent = 'Read Less';
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---- Rating ----
  const stars = document.querySelectorAll(".star");
  let rating = 0;
  if (stars.length) {
    stars.forEach(star => star.addEventListener("click", () => {
      rating = Number(star.dataset.value) || 0;
      stars.forEach(s => {
        const val = Number(s.dataset.value) || 0;
        s.classList.toggle("active", val <= rating);
      });
    }));
  }

  // ---- Form Validation & Multi-step ----
  const form = document.querySelector("form");
  const steps = document.querySelectorAll(".form-step");
  let currentStep = 0;

  function showError(input, msg) {
    if (!input) return;
    const error = document.createElement("small");
    error.className = "error";
    error.style.color = "#e75480";
    error.textContent = msg;
    input.insertAdjacentElement("afterend", error);
  }

  function clearErrors() {
    document.querySelectorAll(".error").forEach(e => e.remove());
  }

  function validateStep(stepIndex) {
    clearErrors();
    let valid = true;
    const name = document.getElementById("name");
    const phone = document.getElementById("phone");
    const email = document.getElementById("email");
    const message = document.getElementById("message");

    if (stepIndex === 0 && name && name.value.trim() === "") {
      showError(name, "Please enter your full name.");
      valid = false;
    }

    if (stepIndex === 1) {
      if (phone && !/^\d{10,}$/.test(phone.value.replace(/\D/g, ""))) { 
        showError(phone, "Enter a valid phone number (10+ digits).");
        valid = false;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        showError(email, "Enter a valid email address.");
        valid = false;
      }
    }

    if (stepIndex === 2 && message && message.value.trim() === "") {
      showError(message, "Please enter a message.");
      valid = false;
    }

    return valid;
  }

  function showStep(index) {
    if (!steps || steps.length === 0) return;
    steps.forEach((step, i) => step.classList.toggle("active", i === index));
  }

  // next / back buttons
  document.querySelectorAll(".next-btn").forEach(btn =>
    btn.addEventListener("click", () => {
      if (validateStep(currentStep) && currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
      }
    })
  );

  document.querySelectorAll(".back-btn").forEach(btn =>
    btn.addEventListener("click", () => {
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    })
  );

  showStep(currentStep);

  // ---- Reset Form Button ----
  const resetBtn = document.getElementById('resetForm');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const formEl = document.querySelector("form");
      if (formEl) formEl.reset();
      clearErrors();
      currentStep = 0;
      showStep(currentStep);
    });
  }
  

  // ---- Switch Statements for Greeting ----
  const welcome = document.getElementById("welcomeMessage");
  const nowHour = new Date().getHours();
  let greeting = "";
  switch(true){
    case (nowHour >= 5 && nowHour < 12): greeting = "Good Morning!"; break;
    case (nowHour >= 12 && nowHour < 18): greeting = "Good Afternoon!"; break;
    case (nowHour >= 18 && nowHour < 22): greeting = "Good Evening!"; break;
    default: greeting = "Good Night!";
  }
  if (welcome) welcome.textContent = `${greeting}`;

 // ---- Sound on Form Submission ----
const contactForm = document.getElementById("multiStepForm");
if (contactForm) {
  const successSound = new Audio("success.mp3");

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    const submitBtn = contactForm.querySelector('button[type="submit"], #submit');
    if (!submitBtn) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      Please wait...
    `;

    setTimeout(() => {
      submitBtn.innerHTML = "Send";
      submitBtn.disabled = false;

      try {
        successSound.play();
      } catch (e) {
        console.warn("Sound couldn't be played:", e);
      }

      showNotification2("✅ Your message has been successfully sent!");

      contactForm.reset();
      currentStep = 0;
      showStep(currentStep);
    }, 1000);
  });
}

function showNotification2(message) {
  const notification2 = document.createElement("div");
  notification2.className = "custom-toast";
  notification2.textContent = message;
  document.body.appendChild(notification2);

  setTimeout(() => notification2.classList.add("show"), 10);

  setTimeout(() => {
    notification2.classList.remove("show");
    setTimeout(() => notification2.remove(), 500);
  }, 3000);
}


    // ---- Toast Notification----
    function showNotification2(message) {
      const notification2 = document.createElement("div");
      notification2.className = "custom-toast";
      notification2.textContent = message;
      document.body.appendChild(notification2);

      setTimeout(() => notification2.classList.add("show"), 10);

      setTimeout(() => {
        notification2.classList.remove("show");
        setTimeout(() => notification2.remove(), 500);
      }, 3000);
    }


  //-----Animations----

  //--Navbar Animation ---
  window.addEventListener("load", () => {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;
    navbar.style.opacity = "0";
    navbar.style.transform = "translateY(-50px)";
    navbar.style.transition = "all 0.8s ease";
    setTimeout(() => {
      navbar.style.opacity = "1";
      navbar.style.transform = "translateY(0)";
    }, 200);
  });

  // ---- Change Background Color + Animation  ----
  const changeColorBtn = document.getElementById("changeColorBtn");
  if (changeColorBtn) {
    const colors = ['#f4c2c2', '#b3e5fc', '#c8e6c9', '#fff9c4', '#d1c4e9', '#ffccbc'];
    let currentColor = 0;
    changeColorBtn.addEventListener("click", () => {
      document.body.style.backgroundColor = colors[currentColor];
      currentColor = (currentColor + 1) % colors.length;
      changeColorBtn.style.transform = "scale(1.1)";
      changeColorBtn.style.transition = "transform 0.3s ease";
      setTimeout(() => changeColorBtn.style.transform = "scale(1)", 300);
    });
  }

  // --- Welcome message typing effect ---
  if (welcome) {

    const text = " Welcome to Bloom GYM!";
    let i = 0;
    function typeText() {
      if (i < text.length) {
        welcome.textContent += text.charAt(i);
        i++;
        setTimeout(typeText, 80);
      }
    }
    setTimeout(typeText, 300);
  }

  // --- Home Page: Fade-in animation for sections---
  const fadeElements = document.querySelectorAll(".grid-sidebar, .grid-main, .big-photo");
  if (fadeElements.length) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    fadeElements.forEach(el => observer.observe(el));
  }

  // --- Image hover animation ---
  const images = document.querySelectorAll(".big-photo");
  images.forEach(img => {
    img.addEventListener("mouseenter", () => {
      img.style.transform = "scale(1.05)";
      img.style.transition = "transform 0.3s ease";
    });
    img.addEventListener("mouseleave", () => {
      img.style.transform = "scale(1)";
    });
  });

  // --- Gallery Page: Smooth Carousel Animation  ---
  window.addEventListener("load", () => {
    const carousel = document.getElementById("gymCarousel");
    if (!carousel) return;
    const fadeInImages = imgs => {
      imgs.forEach(img => {
        img.style.opacity = "0";
        img.style.transform = "scale(0.92)";
        img.style.transition = "opacity 0.8s ease, transform 0.8s ease";
        setTimeout(() => {
          img.style.opacity = "1";
          img.style.transform = "scale(1)";
        }, 100);
      });
    };
    const activeSlide = carousel.querySelector(".carousel-item.active img");
    if (activeSlide) fadeInImages([activeSlide]);
    carousel.addEventListener("slid.bs.carousel", () => {
      const imgs = carousel.querySelectorAll(".carousel-item.active img");
      fadeInImages(imgs);
    });
  });

  // -----jQuery parts------
  if (window.jQuery) {
    $(function() {
      console.log("jQuery is ready!");

      // --- Real-time Search and Live Filter ---
      if ($("#photoSearch").length) {
        $("#photoSearch").on("keyup", function() {
          const value = $(this).val().toLowerCase().trim();
          $(".carousel-item").show();

          if (value === "") return;

          $(".carousel-item").each(function() {
            const hasMatch = $(this).find("img").filter(function() {
              return ($(this).attr("alt") || "").toLowerCase().includes(value);
            }).length > 0;

            if (hasMatch) $(this).show(); else $(this).hide();
          });
        });

        // --- Autocomplete Search Suggestions ---
        const programs = ["Strength Training", "Yoga", "Cardio Fitness", "High Heels Dance"];
        $("#photoSearch").on("keyup", function () {
          const input = $(this).val().toLowerCase();
          const matches = programs.filter(p => p.toLowerCase().includes(input));
          $("#photoSuggestions").empty();
          if (input.length > 0) {
            matches.forEach(m => $("#photoSuggestions").append(`<li class="list-group-item">${m}</li>`));
          }
        });

        $(document).on("click", "#photoSuggestions li", function () {
          const selected = $(this).text();
          $("#photoSearch").val(selected);
          $("#photoSuggestions").empty();
          $(".carousel-item img").each(function () {
            const altText = ($(this).attr("alt") || "").toLowerCase();
            if (altText.includes(selected.toLowerCase())) {
              $(this).closest(".carousel-item").addClass("active").siblings().removeClass("active");
              return false;
            }
          });
        });
      }

      // --- Search Highlighting ---
      if ($("#searchBtn").length && $("#searchInput").length) {
        function removeHighlights() {
          $(".highlight").each(function() {
            $(this).replaceWith($(this).text());
          });
        }

        $("#searchBtn").on("click", function() {
          const keyword = $("#searchInput").val().trim();
          removeHighlights();

          if (keyword.length > 0) {
            const regex = new RegExp("(" + keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");

            $("p, .accordion-title").each(function() {
              let html = $(this).html();
              html = html.replace(regex, '<span class="to-highlight">$1</span>');
              $(this).html(html);
            });

            $(".to-highlight").each(function() {
              $(this).wrap('<span class="highlight"></span>');
              $(this).contents().unwrap();
            });
          }
        });

        $("#searchInput").on("input", function() {
          if ($(this).val().trim() === "") removeHighlights();
        });
      }

      // --- Lazy Loading Images ---
      function lazyLoadImages() {
        $('.lazy').each(function() {
          const img = $(this);
          const imgTop = img.offset().top;
          const windowBottom = $(window).scrollTop() + $(window).height();
          if (imgTop < windowBottom + 100) {
            const src = img.attr('data-src');
            if (src) {
              img.attr('src', src);
              img.addClass('loaded');
              img.removeAttr('data-src');
            }
          }
        });
      }
      lazyLoadImages();
      $(window).on('scroll resize', lazyLoadImages);

      // --- Copied to Clipboard Button ---
      $('.copy-btn').on('click', function () {
      const $btn = $(this);
      const $card = $btn.closest('.contact-card');
      let text = '';
      $card.find('h3, p').each(function () {
        text += $(this).text().trim() + '\n';
      });
      const $temp = $('<textarea>');
      $('body').append($temp);
      $temp.val(text.trim()).select();
      document.execCommand('copy');
      $temp.remove();
      $btn.trigger('copy');
    });

    $('.copy-btn').on('copy', function () {
      const $btn = $(this);
      $btn.html('&#10004;');
      const $tooltip = $('<span class="tooltip">Copied to clipboard!</span>');
      $btn.append($tooltip);
      $btn.addClass('copied');
      $tooltip.fadeIn(200);
      setTimeout(() => {
        $tooltip.fadeOut(200, function () { $(this).remove(); });
        $btn.html('Copy');
        $btn.removeClass('copied');
      }, 2000);
    });

    }); 
  } 

  // ----- Pure JS parts -----
  // Scroll Progress Bar
  window.onscroll = function() {
    const progress = document.getElementById("progress-bar");
    if (!progress) return;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (scrollHeight > 0) ? (scrollTop / scrollHeight) * 100 : 0;
    progress.style.width = scrolled + "%";
  };

  // Animated Number Counter
  const counters = document.querySelectorAll('.count');
  const speed = 100;
  const animateCounters = () => {
    counters.forEach(counter => {
      const updateCount = () => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const increment = Math.ceil(target / speed);

        if (count < target) {
          counter.innerText = count + increment;
          setTimeout(updateCount, 30);
        } else {
          counter.innerText = target + '+';
        }
      };
      updateCount();
    });
  };

  if (counters.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(document.querySelector('.stats-section'));
  }

  // THEME TOGGLE 

  const toggle = document.getElementById("themeToggle");
  const currentTheme = localStorage.getItem("theme") || "day";
  document.body.classList.add(currentTheme === "night" ? "night-theme" : "day-theme");
  if (toggle) toggle.checked = currentTheme === "night";

  if (toggle) {
    toggle.addEventListener("change", () => {
      if (toggle.checked) {
        document.body.classList.remove("day-theme");
        document.body.classList.add("night-theme");
        localStorage.setItem("theme", "night");
      } else {
        document.body.classList.remove("night-theme");
        document.body.classList.add("day-theme");
        localStorage.setItem("theme", "day");
      }
    });
  }
 function showNotification(message, duration = 3000) {
  const container = document.getElementById("notification-container");
  if (!container) return;

  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  container.appendChild(notification);

  setTimeout(() => notification.classList.add("show"), 10);


  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

 const navAuthLink = document.getElementById("navAuthLink");
  if (!navAuthLink) return; 

  function refreshNav() {
    const currentUser = localStorage.getItem("currentUser");

    if (currentUser) {
  
      navAuthLink.textContent = "Log Out";
      navAuthLink.removeAttribute("data-bs-toggle");
      navAuthLink.removeAttribute("data-bs-target");
      navAuthLink.href = "#";
      navAuthLink.onclick = () => {
        localStorage.removeItem("currentUser");
        refreshNav();
        window.location.reload(); 
      };
    } else {
      
      navAuthLink.textContent = "Sign Up/In";
      navAuthLink.setAttribute("data-bs-toggle", "modal");
      navAuthLink.setAttribute("data-bs-target", "#authModal");
      navAuthLink.href = "#";
      navAuthLink.onclick = null;
    }
  }

  refreshNav();
  // ===== Sign Up Sign In =====
  const signupFormBlock = document.getElementById("signupFormBlock");
  const signinFormBlock = document.getElementById("signinFormBlock");

  const signupForm = document.getElementById("signupForm");
  const signinForm = document.getElementById("signinForm");
 


  document.addEventListener("input", e => {
    if (e.target.id === "signupPhone") {
      let value = e.target.value.replace(/\D/g, "");
      if (!value.startsWith("7")) value = "7" + value;
      value = value.substring(0, 11);

      let formatted = "+7";
      if (value.length > 1) formatted += " (" + value.substring(1, 4);
      if (value.length >= 4) formatted += ") " + value.substring(4, 7);
      if (value.length >= 7) formatted += "-" + value.substring(7, 9);
      if (value.length >= 9) formatted += "-" + value.substring(9, 11);

      e.target.value = formatted;
    }
  });


  const switchToSignIn = document.getElementById("switchToSignIn");
  const switchToSignUp = document.getElementById("switchToSignUp");

  if (switchToSignIn) {
    switchToSignIn.addEventListener("click", () => {
      signupFormBlock.style.display = "none";
      signinFormBlock.style.display = "block";
      document.getElementById("signinEmail").focus();
      clearErrors();
      clearSignUpGlobalError();
      clearSignInGlobalError();
    });
  }

  if (switchToSignUp) {
    switchToSignUp.addEventListener("click", () => {
      signinFormBlock.style.display = "none";
      signupFormBlock.style.display = "block";
      document.getElementById("signupName").focus();
      clearErrors();
      clearSignUpGlobalError();
      clearSignInGlobalError();
    });
  }

  function showError(input, msg) {
    if (!input) return;
    const error = document.createElement("small");
    error.className = "error";
    error.style.color = "#e75480";
    error.textContent = msg;
    input.insertAdjacentElement("afterend", error);
    input.classList.add("is-invalid");
  }

  function clearErrors() {
    document.querySelectorAll(".error").forEach(e => e.remove());
    document.querySelectorAll(".is-invalid").forEach(e => e.classList.remove("is-invalid"));
  }

 
  function showSignUpGlobalError(msg) {
    const globalError = document.getElementById("signupGlobalError");
    if (globalError) {
      globalError.textContent = msg;
      globalError.style.display = "block";
    }
  }

  function clearSignUpGlobalError() {
    const globalError = document.getElementById("signupGlobalError");
    if (globalError) {
      globalError.textContent = "";
      globalError.style.display = "none";
    }
  }

  function showSignInGlobalError(msg) {
    const globalError = document.getElementById("signinGlobalError");
    if (globalError) {
      globalError.textContent = msg;
      globalError.style.display = "block";
    }
  }

  function clearSignInGlobalError() {
    const globalError = document.getElementById("signinGlobalError");
    if (globalError) {
      globalError.textContent = "";
      globalError.style.display = "none";
    }
  }

  // ===== Sign Up =====
  if (signupForm) {
    signupForm.addEventListener("submit", function(e) {
      e.preventDefault();
      clearErrors();
      clearSignUpGlobalError();
      clearSignInGlobalError();

      const name = document.getElementById("signupName");
      const surname = document.getElementById("signupSurname");
      const email = document.getElementById("signupEmail");
      const phone = document.getElementById("signupPhone");
      const password = document.getElementById("signupPassword");

      let valid = true;
      if (!name.value.trim()) { showError(name, "Enter your name"); valid = false; }
      if (!surname.value.trim()) { showError(surname, "Enter your surname"); valid = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { showError(email, "Invalid email"); valid = false; }
      if (!/^\+7\s?\(\d{3}\)\s?\d{3}-\d{2}-\d{2}$/.test(phone.value.trim())) { showError(phone, "Invalid phone"); valid = false; }
      if (password.value.trim().length < 8) { showError(password, "Password must be at least 8 characters"); valid = false; }

      if (!valid) return;

      const emailLower = email.value.trim().toLowerCase();
      const userKey = "user_" + emailLower;
      if (localStorage.getItem(userKey)) {
        showSignUpGlobalError("This account already exists. Please sign in below.");
        return;
      }

      const userData = {
        name: name.value.trim(),
        surname: surname.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        password: password.value.trim()
      };
      localStorage.setItem(userKey, JSON.stringify(userData));

      localStorage.setItem("currentUser", emailLower);

      showNotification("Registration successful!");
      window.location.href = `profile.html`;
    });
  }

  // ===== Sign In =====
  if (signinForm) {
    signinForm.addEventListener("submit", function(e) {
      e.preventDefault();
      clearErrors();
      clearSignInGlobalError();
      clearSignUpGlobalError();

      const email = document.getElementById("signinEmail");
      const password = document.getElementById("signinPassword");

      let valid = true;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { showError(email, "Invalid email"); valid = false; }
      if (!password.value.trim()) { showError(password, "Enter your password"); valid = false; }

      if (!valid) return;

      const emailLower = email.value.trim().toLowerCase();
      const userKey = "user_" + emailLower;
      const userData = JSON.parse(localStorage.getItem(userKey));

      if (!userData) {
        showSignInGlobalError("This account doesn't exist. Please sign up.");
        return;
      }

      if (userData.password === password.value.trim()) {
        localStorage.setItem("currentUser", emailLower);
        showNotification("Logged in successfully!");
          setTimeout(() => {
            window.location.href = `profile.html`;
          }, 500);
          
        
      } else {
        showSignInGlobalError("Incorrect email or password");
      }
    });
  }
  

const currentEmail = localStorage.getItem("currentUser");
const profileDataBlock = document.getElementById("profileData");
const logoutBtn = document.getElementById("logoutBtn");
const authForms = document.getElementById("authForms");
const extraDisplay = document.getElementById("extraDisplay");

if (currentEmail) {
  if (profileDataBlock) profileDataBlock.style.display = "block";
  if (logoutBtn) logoutBtn.style.display = "block";
  if (authForms) authForms.style.display = "none";

  const userKey = "user_" + currentEmail;
  const extraKey = "extraData_" + currentEmail;

  const userData = JSON.parse(localStorage.getItem(userKey)) || {};
  const extraData = JSON.parse(localStorage.getItem(extraKey)) || {};

 
  profileDataBlock.innerHTML = `
    <form id="fullEditForm" class="mt-3">
      <h5 class="mb-3 fw-semibold text-center">Profile Information</h5>
      <div class="mb-3">
        <label class="form-label fw-semibold">First Name </label>
        <div class="input-group">
              <span class="input-group-text"><i class="bi bi-person"></i></span>
        <input type="text" id="editName" class="form-control" value="${userData.name || ''}">
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label fw-semibold">Last Name</label>
        <div class="input-group">
              <span class="input-group-text"><i class="bi bi-person-badge"></i></span>
        <input type="text" id="editSurname" class="form-control" value="${userData.surname || ''}">
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label fw-semibold">Email</label>
        <div class="input-group">
              <span class="input-group-text"><i class="bi bi-envelope"></i></span>
        <input type="email" id="editEmail" class="form-control" value="${userData.email || ''}" disabled>
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label fw-semibold">Phone</label>
        <div class="input-group">
              <span class="input-group-text"><i class="bi bi-telephone"></i></span>
        <input type="text" id="editPhone" class="form-control" value="${userData.phone || ''}">
        </div>
      </div>

      <h5 class="mb-3 mt-4 fw-semibold text-center">Additional Information</h5>
      <div class="mb-3">
        <label class="form-label fw-semibold">City</label>
        <input type="text" id="city" class="form-control" value="${extraData.city || ''}">
      </div>
      <div class="mb-3">
        <label class="form-label fw-semibold">Date of Birth</label>
        <input type="date" id="date" class="form-control" value="${extraData.date || ''}">
      </div>
      <div class="mb-3">
        <label class="form-label fw-semibold">Goal</label>
        <input type="text" id="goal" class="form-control" value="${extraData.goal || ''}">
      </div>
      <div class="mb-3">
        <label class="form-label fw-semibold">Favourite color</label>
        <input type="color" id="color" class="form-control" value="${extraData.color || ''}">
      </div>

      <button type="submit" class="btn btn-secondary w-100 mt-3">Save Changes</button>
    </form>
  `;

  const fullForm = document.getElementById("fullEditForm");
  fullForm.addEventListener("submit", e => {
    e.preventDefault();

    userData.name = document.getElementById("editName").value.trim();
    userData.surname = document.getElementById("editSurname").value.trim();
    userData.phone = document.getElementById("editPhone").value.trim();

    const date = document.getElementById("date").value.trim();
    const goal = document.getElementById("goal").value.trim();
    const city = document.getElementById("city").value.trim();
    const color = document.getElementById("color").value.trim();
    


    localStorage.setItem(userKey, JSON.stringify(userData));
    localStorage.setItem(extraKey, JSON.stringify({ city,date, goal,color }));

    displayExtra({ city,date, goal,color});
    showNotification("All information saved successfully!");
  });

  displayExtra(extraData);

  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    showNotification("You have successfully logged out!");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
  });
  

} else {
  if (authForms) authForms.style.display = "block";
}

function displayExtra(data) {
  extraDisplay.innerHTML = `
    <p><strong>City:</strong> ${data.city || ''}</p>
    <p><strong>Birth Date:</strong> ${data.date || ''}</p>
    <p><strong>Goal:</strong> ${data.goal || ''}</p>
    <p><strong>Color:</strong> ${data.color || ''}</p>

  `;
}

// === 🍏 Spoonacular API (Nutrition Tips) ===
const spoonacularApiKey = "9e88d623c5684caaa22da0a024ad710f"; 
const recipesContainer = document.getElementById("recipes-container");
const searchBtn = document.getElementById("searchNutritionBtn");
const searchInput = document.getElementById("nutritionSearch");
const suggestionsContainer = document.getElementById("suggestions");

  loadNutritionTips("healthy fitness meal");

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) {
    loadNutritionTips(query);
  }
});

function loadNutritionTips(query) {
  recipesContainer.innerHTML = "<p class='text-center'>Loading recipes...</p>";
  suggestionsContainer.innerHTML = "";

  fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=3&addRecipeNutrition=true&apiKey=${spoonacularApiKey}`)
    .then(res => res.json())
    .then(data => {
      recipesContainer.innerHTML = "";
      if (!data.results || data.results.length === 0) {
        recipesContainer.innerHTML = "<p class='text-center text-danger'>No recipes found. Try another keyword!</p>";
        return;
      }

      data.results.forEach(recipe => {
  const card = document.createElement("div");
  card.classList.add("col-md-4");

  let calories = "-", protein = "-", fat = "-", carbs = "-";
  if (recipe.nutrition && recipe.nutrition.nutrients) {
    recipe.nutrition.nutrients.forEach(nutrient => {
      switch(nutrient.name) {
        case "Calories":
          calories = Math.round(nutrient.amount);
          break;
        case "Protein":
          protein = Math.round(nutrient.amount);
          break;
        case "Fat":
          fat = Math.round(nutrient.amount);
          break;
        case "Carbohydrates":
          carbs = Math.round(nutrient.amount);
          break;
      }
    });
  }

  card.innerHTML = `
    <div class="card mb-4 shadow-sm">
      <img src="${recipe.image}" class="card-img-top" alt="${recipe.title}">
      <div class="card-body">
        <h5 class="card-title">${recipe.title}</h5>
        <p><strong>Calories:</strong> ${calories} kcal</p>
        <p><strong>Protein:</strong> ${protein} g</p>
        <p><strong>Fat:</strong> ${fat} g</p>
        <p><strong>Carbs:</strong> ${carbs} g</p>
        <a href="https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-')}-${recipe.id}" target="_blank" class="btn btn-outline-danger btn-sm">View Recipe</a>
      </div>
    </div>
  `;
  recipesContainer.appendChild(card);
});


      fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?query=${query}&number=3&apiKey=${spoonacularApiKey}`)
        .then(res => res.json())
        .then(suggestions => {
          if (suggestions.length > 0) {
            suggestionsContainer.innerHTML = "<strong>Try also:</strong> ";
            suggestions.forEach((item, index) => {
              const btn = document.createElement("button");
              btn.className = "btn btn-outline-secondary btn-sm mx-1 my-1";
              btn.textContent = item.name;
              btn.addEventListener("click", () => {
                searchInput.value = item.name;
                loadNutritionTips(item.name);
              });
              suggestionsContainer.appendChild(btn);
            });
          }
        })
        .catch(err => console.error("Suggestions error:", err));

    })
    .catch(err => {
      console.error(err);
      recipesContainer.innerHTML = "<p class='text-center text-danger'>Error loading recipes. Try again later.</p>";
    });
}


});

