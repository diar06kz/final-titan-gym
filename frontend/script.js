const API_BASE = "http://localhost:5001";

// -------------------- Token helpers --------------------
function getToken() { return localStorage.getItem("token"); }
function setToken(token) { localStorage.setItem("token", token); }
function clearToken() { localStorage.removeItem("token"); }

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
        const data = await api("/register", { method: "POST", body: JSON.stringify(payload) });
        setToken(data.token);
        showNotification("Welcome to Titan GYM!");
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
        const data = await api("/login", { method: "POST", body: JSON.stringify(payload) });
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
  // Same logic as before, assuming Profile Page exists
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
    document.getElementById("pRole").value = u?.role || "Athlete";
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
        await api("/users/profile", { method: "PUT", body: JSON.stringify(payload) });
        showNotification("Profile updated!");
      } catch (err) {
        showNotification(err.message);
      }
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

// -------------------- MALE PROGRAMS (UPDATED) --------------------
// Updated to reflect a Men's Gym (Titan Gym)
const PROGRAMS = [
  {
    id: "s1",
    title: "Powerlifting 101",
    category: "strength",
    desc: "Master the Big Three: Squat, Bench, Deadlift.",
    duration: "90 min",
    level: "All Levels",
    image: "pictures/power.jpg", // Ensure these files exist or use placeholders
    slots: ["10:30", "13:00", "15:00", "17:30", "19:00", "20:00"]
  },
  {
    id: "s2",
    title: "Hypertrophy Upper",
    category: "strength",
    desc: "Volume training for chest, back, and arms.",
    duration: "75 min",
    level: "Intermediate",
    image: "pictures/hypertr.jpg",
    slots: ["11:00", "14:00", "17:00", "18:30", "20:00"]
  },
  {
    id: "s3",
    title: "Leg Day Destruction",
    category: "strength",
    desc: "High intensity leg workout. Walking not guaranteed.",
    duration: "60 min",
    level: "Advanced",
    image: "pictures/home3.jpg",
    slots: ["10:00", "15:00", "18:30", "20:30", "22:00"]
  },
  {
    id: "s4",
    title: "Iron Core",
    category: "strength",
    desc: "Abdominal and lower back conditioning.",
    duration: "40 min",
    level: "All levels",
    image: "pictures/ironcore.jpg",
    slots: ["12:00", "13:30", "16:30", "18:30", "20:00", "21:30"]
  },

  {
    id: "c1",
    title: "HIIT Sprint",
    category: "cardio",
    desc: "Max effort intervals for shredding fat.",
    duration: "45 min",
    level: "Intermediate",
    image: "pictures/hitsprint.jpg",
    slots: ["10:00", "13:00", "15:30", "18:30", "20:00"]
  },
  {
    id: "c2",
    title: "Endurance Run",
    category: "cardio",
    desc: "Stamina building for long distance.",
    duration: "60 min",
    level: "Beginner",
    image: "pictures/run.jpg",
    slots: ["07:00", "15:00", "17:00", "19:00"]
  },
  {
    id: "c3",
    title: "Rowing Machine",
    category: "cardio",
    desc: "Full body cardio using concept2 rowers.",
    duration: "45 min",
    level: "All levels",
    image: "pictures/endurance.jpg",
    slots: ["11:00", "16:00", "18:00", "20:30"]
  },
  
  {
    id: "y1",
    title: "Mobility & Recovery",
    category: "yoga",
    desc: "Improve range of motion for heavy lifts.",
    duration: "60 min",
    level: "All levels",
    image: "pictures/yoga.jpg",
    slots: ["09:00", "12:00", "15:00", "18:30", "21:00"]
  },
  {
    id: "y2",
    title: "Post-Workout Stretch",
    category: "yoga",
    desc: "Prevent injury and reduce soreness.",
    duration: "30 min",
    level: "Beginner",
    image: "pictures/stretch.jpg",
    slots: ["10:00", "14:00", "21:00"]
  },

  {
    id: "d1",
    title: "Boxing Fundamentals",
    category: "combat",
    desc: "Footwork, jabs, and defense.",
    duration: "60 min",
    level: "All levels",
    image: "pictures/box.jpg", // Reuse filename or rename file on disk
    slots: ["11:00", "14:00", "17:00", "19:30", "21:00"]
  },
  {
    id: "d2",
    title: "MMA Sparring",
    category: "combat",
    desc: "Controlled sparring for experienced fighters.",
    duration: "90 min",
    level: "Advanced",
    image: "pictures/mma.jpg",
    slots: ["18:30", "20:00"]
  },
  {
    id: "d3",
    title: "Muay Thai",
    category: "combat",
    desc: "The art of eight limbs. Clinch and strike.",
    duration: "60 min",
    level: "Intermediate",
    image: "pictures/kickbox.jpg",
    slots: ["12:00", "15:00", "18:00", "20:30"]
  }
];

// -------------------- Programs page render --------------------
function initProgramsPage() {
  const grid = document.getElementById("programsGrid");
  const empty = document.getElementById("programsEmpty");
  if (!grid || !empty) return; 

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
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="card-title text-uppercase">${p.title}</h5>
            <span class="badge text-bg-danger">${p.category}</span>
          </div>
          <p class="card-text text-muted mb-3 small">${p.desc}</p>
          <div class="d-flex gap-2 mb-3">
            <span class="badge text-bg-light border text-dark">${p.duration}</span>
            <span class="badge text-bg-light border text-dark">${p.level}</span>
          </div>
          <button class="btn btn-dark w-100 mt-auto" data-book="${p.id}">BOOK SESSION</button>
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

  const first = document.querySelector('[data-cat="all"]');
  if (first) setActive(first);
  render("all");

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
      showNotification("Please sign in to book a session.");
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

    titleEl.textContent = selectedProgram.title;
    setError("");

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    dateEl.value = `${yyyy}-${mm}-${dd}`;
    timeEl.innerHTML = "";

    const slots = selectedProgram?.slots || [];
    if (slots.length) {
      slots.forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        timeEl.appendChild(opt);
      });
      timeEl.value = slots[0]; 
    } else {
      const opt = document.createElement("option");
      opt.textContent = "No slots";
      timeEl.appendChild(opt);
    }

    noteEl.value = "";
    const modal = window.bootstrap?.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
    modal.show();
  });

  confirmBtn.addEventListener("click", async () => {
    try {
      setError("");
      if (!selectedProgram) return setError("Program not selected.");
      if (!dateEl.value) return setError("Choose a date.");
      if (!timeEl.value) return setError("Choose a time.");

      const payload = {
        programTitle: selectedProgram.title,
        category: selectedProgram.category,
        date: dateEl.value,
        time: timeEl.value || "",
        note: noteEl.value.trim()
      };

      await api("/bookings", { method: "POST", body: JSON.stringify(payload) });
      showNotification("Session Booked!");
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
    if (titleEl) titleEl.textContent = "My Sessions";
    table.style.display = "none";
    empty.style.display = "block";
    empty.textContent = "Sign in to see your schedule.";
    return;
  }

  try {
    const me = await api("/users/profile", { method: "GET" });
    const role = me?.user?.role;
    const canSeeAll = role === "admin" || role === "moderator";

    if (titleEl) titleEl.textContent = canSeeAll ? "All Gym Bookings" : "My Sessions";
    const endpoint = canSeeAll ? "/bookings/admin/all" : "/bookings";
    const data = await api(endpoint, { method: "GET" });
    const list = data?.bookings || [];

    body.innerHTML = "";
    if (!list.length) {
      table.style.display = "none";
      empty.style.display = "block";
      empty.textContent = "No sessions found.";
      return;
    }

    empty.style.display = "none";
    table.style.display = "table";

    // Table header update
    const theadRow = table.querySelector("thead tr");
    if (theadRow) {
      theadRow.innerHTML = canSeeAll
        ? `<th>User</th><th>Email</th><th>Program</th><th>Cat</th><th>Date</th><th>Time</th><th>Status</th><th>Note</th><th class="text-end">Act</th>`
        : `<th>Program</th><th>Cat</th><th>Date</th><th>Time</th><th>Status</th><th>Note</th><th class="text-end">Act</th>`;
    }

    list.forEach((b) => {
      const tr = document.createElement("tr");
      const isActive = b.status === "booked";
      const statusBadge = isActive 
        ? `<span class="badge bg-success">active</span>` 
        : `<span class="badge bg-secondary">cancelled</span>`;
      
      const updateBtn = isActive ? `<button class="btn btn-sm btn-outline-secondary" data-edit-booking="${b._id}">Edit</button>` : "";
      const cancelBtn = (!canSeeAll && isActive) ? `<button class="btn btn-sm btn-outline-warning ms-1" data-cancel-booking="${b._id}">Cancel</button>` : "";
      const deleteBtn = (role === "admin") ? `<button class="btn btn-sm btn-outline-danger ms-1" data-del-booking="${b._id}">Del</button>` : "";

      const actions = `<td class="text-end text-nowrap">${updateBtn}${cancelBtn}${deleteBtn}</td>`;

      const coreData = `
        <td class="fw-bold text-uppercase small">${b.programTitle}</td>
        <td class="small">${b.category}</td>
        <td>${(b.date || "").slice(0, 10)}</td>
        <td>${b.time || "-"}</td>
        <td>${statusBadge}</td>
        <td class="small text-muted">${b.note || "-"}</td>
        ${actions}
      `;

      if (canSeeAll) {
         tr.innerHTML = `<td>${b.user?.name}</td><td>${b.user?.email}</td>` + coreData;
      } else {
         tr.innerHTML = coreData;
      }
      body.appendChild(tr);
    });
  } catch (err) {
    table.style.display = "none";
    empty.style.display = "block";
    empty.textContent = err.message;
  }
}

// -------------------- Actions: Delete & Cancel --------------------
document.addEventListener("click", async (e) => {
  const btnDel = e.target.closest("[data-del-booking]");
  if (btnDel) {
    const id = btnDel.getAttribute("data-del-booking");
    try {
      await api(`/bookings/${id}`, { method: "DELETE" });
      showNotification("Deleted.");
      await loadMyBookings();
    } catch(e) { showNotification(e.message); }
    return;
  }

  const btnCancel = e.target.closest("[data-cancel-booking]");
  if (btnCancel) {
    const id = btnCancel.getAttribute("data-cancel-booking");
    try {
      await api(`/bookings/${id}`, { method: "PUT", body: JSON.stringify({ status: "cancelled" }) });
      showNotification("Cancelled.");
      await loadMyBookings();
    } catch(e) { showNotification(e.message); }
    return;
  }

  // Edit open
  const btnEdit = e.target.closest("[data-edit-booking]");
  if (btnEdit) {
    const id = btnEdit.getAttribute("data-edit-booking");
    try {
      const data = await api(`/bookings/${id}`, { method: "GET" });
      const booking = data.booking;
      if(!booking) throw new Error("Not found");

      document.getElementById("editBookingId").value = booking._id;
      document.getElementById("editDate").value = (booking.date || "").slice(0, 10);
      document.getElementById("editNote").value = booking.note || "";
      
      const editTimeEl = document.getElementById("editTime");
      editTimeEl.innerHTML = "";
      
      const prog = PROGRAMS.find(p => p.title === booking.programTitle);
      const slots = prog?.slots || [];
      if(slots.length){
        slots.forEach(t => {
           const o = document.createElement("option");
           o.value = t; o.textContent = t;
           editTimeEl.appendChild(o);
        });
        editTimeEl.value = slots.includes(booking.time) ? booking.time : slots[0];
      } else {
         const o = document.createElement("option");
         o.value = booking.time; o.textContent = booking.time;
         editTimeEl.appendChild(o);
      }

      const modalEl = document.getElementById("editBookingModal");
      const m = window.bootstrap?.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
      m.show();
    } catch(e) { showNotification(e.message); }
  }
});

// -------------------- Init Edit Save --------------------
function initEditBookingSave() {
  const btn = document.getElementById("editConfirmBtn");
  if(!btn) return;
  btn.addEventListener("click", async () => {
    const id = document.getElementById("editBookingId").value;
    const payload = {
      date: document.getElementById("editDate").value,
      time: document.getElementById("editTime").value,
      note: document.getElementById("editNote").value.trim()
    };
    try {
      await api(`/bookings/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      showNotification("Session updated!");
      await loadMyBookings();
      const m = window.bootstrap.Modal.getInstance(document.getElementById("editBookingModal"));
      m.hide();
    } catch(e) { showNotification(e.message); }
  });
}

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