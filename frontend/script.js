const API_BASE = "http://localhost:5000";

// -------------------- Token helpers --------------------
function getToken() {
  return localStorage.getItem("token");
}
function setToken(token) {
  localStorage.setItem("token", token);
}
function clearToken() {
  localStorage.removeItem("token");
}

// -------------------- API helper --------------------
async function api(path, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};
  headers["Content-Type"] = "application/json";

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const msg = data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

// -------------------- Notifications --------------------
function showNotification(message, duration = 3000) {
  const container = document.getElementById("notification-container");
  if (!container) return;

  const el = document.createElement("div");
  el.className = "notification";
  el.textContent = message;
  container.appendChild(el);

  setTimeout(() => el.classList.add("show"), 10);

  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 250);
  }, duration);
}

function setGlobalError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = msg ? "block" : "none";
}

// -------------------- AUTH modal --------------------
function initAuthModal() {
  const signupForm = document.getElementById("signupForm");
  const signinForm = document.getElementById("signinForm");

  const signupBlock = document.getElementById("signupFormBlock");
  const signinBlock = document.getElementById("signinFormBlock");

  const switchToSignIn = document.getElementById("switchToSignIn");
  const switchToSignUp = document.getElementById("switchToSignUp");

  if (switchToSignIn) {
    switchToSignIn.addEventListener("click", () => {
      signupBlock.style.display = "none";
      signinBlock.style.display = "block";
      setGlobalError("signupGlobalError", "");
      setGlobalError("signinGlobalError", "");
    });
  }
  if (switchToSignUp) {
    switchToSignUp.addEventListener("click", () => {
      signinBlock.style.display = "none";
      signupBlock.style.display = "block";
      setGlobalError("signupGlobalError", "");
      setGlobalError("signinGlobalError", "");
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      setGlobalError("signupGlobalError", "");

      const payload = {
        name: document.getElementById("signupName").value.trim(),
        surname: document.getElementById("signupSurname").value.trim(),
        email: document.getElementById("signupEmail").value.trim(),
        phone: document.getElementById("signupPhone").value.trim(),
        password: document.getElementById("signupPassword").value
      };

      try {
        const data = await api("/register", {
          method: "POST",
          body: JSON.stringify(payload)
        });

        setToken(data.token);
        showNotification("Account created! You are logged in.");

        const modalEl = document.getElementById("authModal");
        const modal = window.bootstrap?.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
        modal.hide();

        updateNavAuth();
        initProfilePage();
        loadMyBookings();

      } catch (err) {
        setGlobalError("signupGlobalError", err.message);
      }
    });
  }

  if (signinForm) {
    signinForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      setGlobalError("signinGlobalError", "");

      const payload = {
        email: document.getElementById("signinEmail").value.trim(),
        password: document.getElementById("signinPassword").value
      };

      try {
        const data = await api("/login", {
          method: "POST",
          body: JSON.stringify(payload)
        });

        setToken(data.token);
        showNotification("Logged in successfully!");

        const modalEl = document.getElementById("authModal");
        const modal = window.bootstrap?.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
        modal.hide();

        updateNavAuth();
        initProfilePage();
        loadMyBookings();

      } catch (err) {
        setGlobalError("signinGlobalError", err.message);
      }
    });
  }
}

// -------------------- Navbar auth link --------------------
function updateNavAuth() {
  const link = document.getElementById("navAuthLink");
  if (!link) return;

  const token = getToken();
  if (token) {
    link.textContent = "Logout";
    link.removeAttribute("data-bs-toggle");
    link.removeAttribute("data-bs-target");
    link.href = "#";
    link.onclick = async (e) => {
      e.preventDefault();
      clearToken();
      showNotification("Logged out.");
      updateNavAuth();
      initProfilePage();
      await loadMyBookings(); 
    };

  } else {
    link.textContent = "Sign Up/In";
    link.setAttribute("data-bs-toggle", "modal");
    link.setAttribute("data-bs-target", "#authModal");
    link.onclick = null;
  }
}

// -------------------- Profile Page --------------------
async function initProfilePage() {
  const panel = document.getElementById("profilePanel");
  const locked = document.getElementById("profileLocked");
  const profileForm = document.getElementById("profileForm");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!panel || !locked) return;

  if (!getToken()) {
    locked.style.display = "block";
    panel.style.display = "none";
    return;
  }

  locked.style.display = "none";
  panel.style.display = "block";

  try {
    const me = await api("/users/profile", { method: "GET" });
    const u = me.user;

    document.getElementById("pName").value = u?.name || "";
    document.getElementById("pSurname").value = u?.surname || "";
    document.getElementById("pEmail").value = u?.email || "";
    const roleMap = {
      admin: "Administrator",
      moderator: "Moderator",
      user: "User",
      premium: "Premium user"
    };

    document.getElementById("pRole").value = roleMap[u?.role] || u?.role || "User";

    document.getElementById("pPhone").value = u?.phone || "";
    document.getElementById("pCity").value = u?.city || "";
    document.getElementById("pDob").value = u?.dateOfBirth ? String(u.dateOfBirth).slice(0, 10) : "";
    document.getElementById("pGoal").value = u?.goal || "";
  } catch (err) {
    showNotification(err.message);
  }

  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        const payload = {
          name: document.getElementById("pName").value.trim(),
          surname: document.getElementById("pSurname").value.trim(),
          phone: document.getElementById("pPhone").value.trim(),
          city: document.getElementById("pCity").value.trim(),
          dateOfBirth: document.getElementById("pDob").value || null,
          goal: document.getElementById("pGoal").value.trim()
        };

        await api("/users/profile", {
          method: "PUT",
          body: JSON.stringify(payload)
        });

        showNotification("Profile updated!");
      } catch (err) {
        showNotification(err.message);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearToken();
      showNotification("Logged out.");
      updateNavAuth();
      locked.style.display = "block";
      panel.style.display = "none";
    });
  }
}

// -------------------- Home: Animations --------------------
function initHomeAnimations() {
  const els = document.querySelectorAll(".grid-sidebar, .grid-main, .big-photo");
  if (!els.length) return;

  els.forEach((el) => el.classList.add("fade-in"));
}

// -------------------- Home: Lazy images --------------------
function initLazyImages() {
  const imgs = document.querySelectorAll("img.lazy[data-src]");
  if (!imgs.length) return;

  const loadImg = (img) => {
    img.src = img.dataset.src;
    img.onload = () => img.classList.add("loaded");
    img.removeAttribute("data-src");
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadImg(entry.target);
        obs.unobserve(entry.target);
      });
    });

    imgs.forEach((img) => observer.observe(img));
  } else {
    imgs.forEach(loadImg);
  }
}

// -------------------- Home: Stats counters --------------------
function initStatsCounter() {
  const counters = document.querySelectorAll(".count[data-target]");
  if (!counters.length) return;

  counters.forEach((el) => {
    const target = Number(el.getAttribute("data-target") || 0);
    if (!target) return;

    let current = 0;
    const steps = 60; 
    const increment = Math.max(1, Math.floor(target / steps));

    const tick = () => {
      current += increment;
      if (current >= target) {
        el.textContent = String(target);
        return;
      }
      el.textContent = String(current);
      requestAnimationFrame(tick);
    };

    tick();
  });
}

// -------------------- Home: Date & time --------------------
function initDateTime() {
  const el = document.getElementById("dateTime");
  if (!el) return;

  const update = () => {
    const now = new Date();
    el.textContent = now.toLocaleString();
  };

  update();
  setInterval(update, 1000);
}

function applyTheme(isNight) {
  document.body.classList.toggle("night-theme", isNight);
}

function initTheme() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  const saved = localStorage.getItem("theme"); 
  const isNight = saved === "night";
  toggle.checked = isNight;
  applyTheme(isNight);

  toggle.addEventListener("change", () => {
    const night = toggle.checked;
    applyTheme(night);
    localStorage.setItem("theme", night ? "night" : "light");
  });
}

// -------------------- Programs data (STATIC) --------------------
const PROGRAMS = [
  {
    id: "s1",
    title: "Strength Basics",
    category: "strength",
    desc: "Full-body strength training for beginners.",
    duration: "60 min",
    level: "Beginner",
    image: "pictures/strength.jpg",
    slots: ["10:30", "13:00", "15:00","17:30", "19:00", "20:00"]
  },
  {
    id: "s2",
    title: "Upper Body Strength",
    category: "strength",
    desc: "Arms, back and shoulders workout.",
    duration: "55 min",
    level: "Intermediate",
    image: "pictures/upperStrength.jpg",
    slots: ["11:00", "14:00", "17:00","18:30", "20:00"]
  },
  {
    id: "s3",
    title: "Lower Body Power",
    category: "strength",
    desc: "Glutes, legs and core focus.",
    duration: "50 min",
    level: "Intermediate",
    image: "pictures/lowerStrength.jpg",
    slots: ["10:00", "15:00", "18:30","20:30", "22:00"]
  },
  {
    id: "s4",
    title: "Core Strength",
    category: "strength",
    desc: "Abs and stability training.",
    duration: "40 min",
    level: "All levels",
    image: "pictures/img2.jpg",
    slots: ["12:00", "13:30", "16:30","18:30", "20:00","21:30"]
  },

  {
    id: "c1",
    title: "HIIT Cardio Burn",
    category: "cardio",
    desc: "High-intensity intervals to burn calories fast.",
    duration: "45 min",
    level: "Intermediate",
    image: "pictures/cardio.jpg",
    slots: ["10:00", "13:00", "15:30","18:30", "20:00"]
  },
  {
    id: "c2",
    title: "Cardio Endurance",
    category: "cardio",
    desc: "Steady cardio to improve stamina.",
    duration: "40 min",
    level: "Beginner",
    image: "pictures/img9.jpg",
    slots: ["11:00", "15:00", "17:00","18:30", "20:00"]
  },
  {
    id: "c3",
    title: "Fat Burn Cardio",
    category: "cardio",
    desc: "Calorie-burning cardio workout.",
    duration: "50 min",
    level: "All levels",
    image: "pictures/FatBurnCardio.jpg",
    slots: ["11:00", "16:00", "18:00","20:30", "22:00"]
  },
  {
    id: "c4",
    title: "Morning Cardio",
    category: "cardio",
    desc: "Light cardio to start your day.",
    duration: "30 min",
    level: "Beginner",
    image: "pictures/img4.jpg",
    slots: ["09:00", "10:00", "11:00","12:30"]
  },

  {
    id: "y1",
    title: "Yoga Flow",
    category: "yoga",
    desc: "Flexibility, balance and breathing practice.",
    duration: "60 min",
    level: "All levels",
    image: "pictures/yoga.jpg",
    slots: ["09:00", "12:00", "15:00","18:30", "21:00"]
  },
  {
    id: "y2",
    title: "Morning Yoga",
    category: "yoga",
    desc: "Gentle yoga to wake up the body.",
    duration: "45 min",
    level: "Beginner",
    image: "pictures/img5.jpg",
    slots: ["07:30", "08:30", "09:30","10:30", "11:30"]
  },
  {
    id: "y3",
    title: "Stretch & Relax",
    category: "yoga",
    desc: "Deep stretching and relaxation.",
    duration: "50 min",
    level: "All levels",
    image: "pictures/Stretch.jpg",
    slots: ["10:00", "14:00", "17:00","19:30", "21:00"]
  },
  {
    id: "y4",
    title: "Power Yoga",
    category: "yoga",
    desc: "Dynamic yoga with strength elements.",
    duration: "55 min",
    level: "Intermediate",
    image: "pictures/img8.jpg",
    slots: ["12:00", "16:00", "18:30","20:00", "21:30"]
  },

  {
    id: "d1",
    title: "HighHeels Dance",
    category: "dance",
    desc: "Fun dance workout + cardio.",
    duration: "50 min",
    level: "All levels",
    image: "pictures/highheels.jpg",
    slots: ["11:00", "14:00", "17:00","19:30", "21:00"]
  },
  {
    id: "d2",
    title: "Hip-Hop Dance",
    category: "dance",
    desc: "Energetic hip-hop choreography.",
    duration: "45 min",
    level: "Intermediate",
    image: "pictures/img12.jpg",
    slots: ["10:00", "13:00", "16:00","18:30", "20:00"]
  },
  {
    id: "d3",
    title: "Latin Dance",
    category: "dance",
    desc: "Latin rhythms and cardio moves.",
    duration: "50 min",
    level: "All levels",
    image: "pictures/img11.jpg",
    slots: ["12:00", "15:00", "18:00","20:30", "22:00"]
  },
  {
    id: "d4",
    title: "Dance Cardio",
    category: "dance",
    desc: "Dance + cardio combo workout.",
    duration: "40 min",
    level: "Beginner",
    image: "pictures/img10.jpg",
    slots: ["11:00", "12:30", "15:30","18:30", "20:00"]
  }
];


// -------------------- Programs page render --------------------
function initProgramsPage() {
  const grid = document.getElementById("programsGrid");
  const empty = document.getElementById("programsEmpty");
  if (!grid || !empty) return; 

  // highlight active filter button
  function setActive(btn) {
    document.querySelectorAll("[data-cat]").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  }

  function render(category = "all") {
    const list = category === "all" ? PROGRAMS : PROGRAMS.filter((p) => p.category === category);

    grid.innerHTML = "";

    if (!list.length) {
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";

    list.forEach((p) => {
      const col = document.createElement("div");
      col.className = "col-sm-12 col-md-6 col-lg-4 col-xl-3";


      col.innerHTML = `
      <div class="program-card h-100">
        <img class="program-img" src="${p.image}" alt="${p.title}">

      
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start">
            <h5 class="card-title mb-1">${p.title}</h5>
            <span class="badge text-bg-danger text-capitalize">${p.category}</span>
          </div>

          <p class="card-text text-muted mb-3">${p.desc}</p>

          <div class="d-flex gap-2 mb-3">
            <span class="badge text-bg-light border">${p.duration}</span>
            <span class="badge text-bg-light border">${p.level}</span>
          </div>

          <button class="btn mt-auto" data-book="${p.id}">
            Book
          </button>
        </div>
      </div>
    `;


      grid.appendChild(col);
    });
  }


  const filterButtons = document.querySelectorAll("[data-cat]");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.getAttribute("data-cat");
      setActive(btn);
      render(cat);
    });
  });

  const first = document.querySelector('[data-cat="all"]') || filterButtons[0];
  if (first) setActive(first);
  render("all");

  // booking modal handlers
  initBookingModal();
}


// -------------------- Booking modal --------------------
let selectedProgram = null;

function initBookingModal() {
  const modalEl = document.getElementById("bookingModal");
  const titleEl = document.getElementById("bmProgramTitle");
  const dateEl = document.getElementById("bmDate");
  const timeEl = document.getElementById("bmTime");
  const noteEl = document.getElementById("bmNote");
  const errEl = document.getElementById("bmError");
  const confirmBtn = document.getElementById("bmConfirmBtn");

  if (!modalEl || !confirmBtn) return;

  function setError(msg) {
    if (!errEl) return;
    errEl.textContent = msg;
    errEl.style.display = msg ? "block" : "none";
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-book]");
    if (!btn) return;

    if (!getToken()) {
      showNotification("Please sign in first to book a program.");
      const authEl = document.getElementById("authModal");
      if (authEl) {
        const authModal = window.bootstrap?.Modal.getInstance(authEl) || new window.bootstrap.Modal(authEl);
        authModal.show();
      }
      return;
    }

    const id = btn.getAttribute("data-book");
    selectedProgram = PROGRAMS.find((p) => p.id === id);
    if (!selectedProgram) return;

    titleEl.textContent = `${selectedProgram.title} (${selectedProgram.category})`;
    setError("");

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    dateEl.value = `${yyyy}-${mm}-${dd}`;
    timeEl.innerHTML = "";

    const slots = selectedProgram?.slots || [];

    if (slots.length) {
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Choose time";
      timeEl.appendChild(placeholder);

      slots.forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        timeEl.appendChild(opt);
      });

      timeEl.value = ""; 
    } else {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No available time slots";
      timeEl.appendChild(opt);
      timeEl.value = "";
    }

        noteEl.value = "";

        const modal = window.bootstrap?.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
        modal.show();
      });

  confirmBtn.addEventListener("click", async () => {
    try {
      setError("");

      if (!selectedProgram) return setError("Program not selected.");
      if (!dateEl.value) return setError("Please choose a date.");
      if (!timeEl.value) return setError("Please choose a time slot.");

      const payload = {
        programTitle: selectedProgram.title,
        category: selectedProgram.category,
        date: dateEl.value,
        time: timeEl.value || "",
        note: noteEl.value.trim()
      };

      await api("/bookings", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      showNotification("✅ Booking created!");
      await loadMyBookings();


      const modal = window.bootstrap?.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
      modal.hide();
    } catch (err) {
      setError(err.message);
    }
  });
}

// -------------------- My Bookings page --------------------
async function loadMyBookings() {
  const titleEl = document.getElementById("bookingsTitle");
  const empty = document.getElementById("bookingsEmpty");
  const table = document.getElementById("bookingsTable");
  const body = document.getElementById("bookingsBody");
  if (!empty || !table || !body) return;

  if (!getToken()) {
    if (titleEl) titleEl.textContent = "My bookings";
    table.style.display = "none";
    empty.style.display = "block";
    empty.textContent = "Please sign in to see your bookings.";
    return;
  }

  try {
    const me = await api("/users/profile", { method: "GET" });
    const role = me?.user?.role;

    const isAdmin = role === "admin";
    const canSeeAll = role === "admin" || role === "moderator";

    if (titleEl) titleEl.textContent = canSeeAll ? "All bookings" : "My bookings";

    const endpoint = canSeeAll ? "/bookings/admin/all" : "/bookings";
    const data = await api(endpoint, { method: "GET" });
    const list = data?.bookings || [];

    body.innerHTML = "";

    if (!list.length) {
      table.style.display = "none";
      empty.style.display = "block";
      empty.textContent = canSeeAll ? "No bookings found." : "You have no bookings yet.";
      return;
    }

    empty.style.display = "none";
    table.style.display = "table";

    const theadRow = table.querySelector("thead tr");
    if (theadRow) {
      theadRow.innerHTML = canSeeAll
        ? `
          <th>User</th>
          <th>Email</th>
          <th>Program</th>
          <th>Category</th>
          <th>Date</th>
          <th>Time</th>
          <th>Status</th>
          <th>Note</th>
          <th class="text-end">Actions</th>
        `
        : `
          <th>Program</th>
          <th>Category</th>
          <th>Date</th>
          <th>Time</th>
          <th>Status</th>
          <th>Note</th>
          <th class="text-end">Actions</th>
        `;
    }

    list.forEach((b) => {
      const tr = document.createElement("tr");

      const userName = `${b.user?.name || ""} ${b.user?.surname || ""}`.trim();
      const userEmail = b.user?.email || "-";

      const status = b.status || "booked"; 
      const isActive = status === "booked";

      const statusBadge =
        status === "booked"
          ? `<span class="badge bg-success">booked</span>`
          : `<span class="badge bg-warning text-dark">cancelled</span>`;

      const updateBtn = isActive
        ? `
          <button class="btn btn-sm btn-outline-secondary"
            data-edit-booking="${b._id}"
            data-bs-toggle="modal"
            data-bs-target="#editBookingModal">
            Update
          </button>
        `
        : "";

      const cancelBtn = (!canSeeAll && isActive)
        ? `<button class="btn btn-sm btn-outline-warning" data-cancel-booking="${b._id}">Cancel</button>`
        : "";

      const deleteBtn = isAdmin
        ? `<button class="btn btn-sm btn-outline-danger" data-del-booking="${b._id}">Delete</button>`
        : "";

      const actions = `<td class="text-end d-flex gap-2 justify-content-end">${updateBtn}${cancelBtn}${deleteBtn}</td>`;

      tr.innerHTML = canSeeAll
        ? `
          <td>${userName || "-"}</td>
          <td>${userEmail}</td>
          <td class="fw-semibold">${b.programTitle || ""}</td>
          <td class="text-capitalize">${b.category || ""}</td>
          <td>${(b.date || "").slice(0, 10)}</td>
          <td>${b.time || "-"}</td>
          <td>${statusBadge}</td>
          <td>${b.note || "-"}</td>
          ${actions}
        `
        : `
          <td class="fw-semibold">${b.programTitle || ""}</td>
          <td class="text-capitalize">${b.category || ""}</td>
          <td>${(b.date || "").slice(0, 10)}</td>
          <td>${b.time || "-"}</td>
          <td>${statusBadge}</td>
          <td>${b.note || "-"}</td>
          ${actions}
        `;

      body.appendChild(tr);
    });
  } catch (err) {
    table.style.display = "none";
    empty.style.display = "block";
    empty.textContent = err.message;
  }
}




document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-del-booking]");
  if (!btn) return;

  const id = btn.getAttribute("data-del-booking");
  if (!id) return;

  try {
    await api(`/bookings/${id}`, { method: "DELETE" });
    showNotification("Booking deleted.");
    await loadMyBookings();
  } catch (err) {
    showNotification(err.message);
  }
});

// ==================== EDIT BOOKING (GET + PUT) ====================

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-edit-booking]");
  if (!btn) return;

  const id = btn.getAttribute("data-edit-booking");
  if (!id) return;

  const errEl = document.getElementById("editError");
  if (errEl) {
    errEl.textContent = "";
    errEl.style.display = "none";
  }

  try {
    const data = await api(`/bookings/${id}`, { method: "GET" });
    const booking = data.booking; 

    if (!booking) throw new Error("Booking not found");

    document.getElementById("editBookingId").value = booking._id;
    document.getElementById("editDate").value = (booking.date || "").slice(0, 10);
    document.getElementById("editTime").value = booking.time || "";
    document.getElementById("editNote").value = booking.note || "";

    const editTimeEl = document.getElementById("editTime");
    editTimeEl.innerHTML = "";

    const prog = PROGRAMS.find(p => p.title === booking.programTitle);
    const slots = prog?.slots || [];

    if (slots.length) {
      slots.forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        editTimeEl.appendChild(opt);
      });

      editTimeEl.value = slots.includes(booking.time) ? booking.time : slots[0];
    } else {
      const opt = document.createElement("option");
      opt.value = booking.time || "";
      opt.textContent = booking.time || "No time slots";
      editTimeEl.appendChild(opt);
      editTimeEl.value = booking.time || "";
    }

    const modalEl = document.getElementById("editBookingModal");
    const modal =
      window.bootstrap?.Modal.getInstance(modalEl) ||
      new window.bootstrap.Modal(modalEl);
    modal.show();
  } catch (err) {
    showNotification(err.message);
  }

});

// Save edited booking
function initEditBookingSave() {
  const editConfirmBtn = document.getElementById("editConfirmBtn");
  if (!editConfirmBtn) return;

  editConfirmBtn.addEventListener("click", async () => {
    const id = document.getElementById("editBookingId").value;
    if (!id) return;

    const payload = {
      date: document.getElementById("editDate").value,
      time: document.getElementById("editTime").value,
      note: document.getElementById("editNote").value.trim()
    };

    try {
      await api(`/bookings/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      showNotification("✅ Booking updated!");
      await loadMyBookings();

      const modalEl = document.getElementById("editBookingModal");
      const modal =
        window.bootstrap?.Modal.getInstance(modalEl) ||
        new window.bootstrap.Modal(modalEl);
      modal.hide();
    } catch (err) {
      const errEl = document.getElementById("editError");
      if (errEl) {
        errEl.textContent = err.message;
        errEl.style.display = "block";
      } else {
        showNotification(err.message);
      }
    }
  });
}

// -------------------- Cancel booking --------------------
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-cancel-booking]");
  if (!btn) return;

  const id = btn.getAttribute("data-cancel-booking");
  if (!id) return;

  try {
    await api(`/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: "cancelled" })
    });

    showNotification("Booking cancelled.");
    await loadMyBookings();
  } catch (err) {
    showNotification(err.message);
  }
});



document.addEventListener("DOMContentLoaded", () => {
  updateNavAuth();
  initProfilePage();
  loadMyBookings();
  initTheme();
  initAuthModal();
  

  initHomeAnimations();
  initLazyImages();
  initStatsCounter();
  initDateTime();

  initProgramsPage();
  initEditBookingSave();
});

