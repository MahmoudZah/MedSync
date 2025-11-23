// MedSync Mock Data
// Mock Database
// In browsers, 'require' is not defined. Instead, fetch JSON using fetch API:

const db = {
  "drugs": [
    {
      "id"  : 1,
      "name": "Augmentin 1g",
      "generic": "Amoxicillin/Clavulanic Acid",
      "image": "https://placehold.co/100x100/e0e0e0/333?text=Augmentin"
    },
    {
      "id": 2,
      "name": "Panadol Extra",
      "generic": "Paracetamol/Caffeine",
      "image": "https://placehold.co/100x100/e0e0e0/333?text=Panadol"
    },
    {
      "id": 3,
      "name": "Cataflam 50mg",
      "generic": "Diclofenac Potassium",
      "image": "https://placehold.co/100x100/e0e0e0/333?text=Cataflam"
    },
    {
      "id": 4,
      "name": "Insulin Lantus",
      "generic": "Insulin Glargine",
      "image": "https://placehold.co/100x100/e0e0e0/333?text=Insulin"
    },
    {
      "id": 5,
      "name": "Concor 5mg",
      "generic": "Bisoprolol",
      "image": "https://placehold.co/100x100/e0e0e0/333?text=Concor"
    }
  ],
  "pharmacies": [
    {
      "id": 101,
      "name": "El Ezaby Pharmacy",
      "location": "Maadi, Cairo",
      "distance": "1.2 km"
    },
    {
      "id": 102,
      "name": "Seif Pharmacy",
      "location": "Nasr City, Cairo",
      "distance": "3.5 km"
    },
    {
      "id": 103,
      "name": "19011 Pharmacy",
      "location": "Dokki, Giza",
      "distance": "5.0 km"
    }
  ],
  "listings": [
    {
      "id": 1,
      "pharmacyId": 101,
      "drugId": 1,
      "quantity": 50,
      "expiryDate": "2025-12-01",
      "originalPrice": 90,
      "discountPrice": 54,
      "status": "Available"
    },
    {
      "id": 2,
      "pharmacyId": 102,
      "drugId": 2,
      "quantity": 120,
      "expiryDate": "2026-03-15",
      "originalPrice": 35,
      "discountPrice": 25,
      "status": "Available"
    },
    {
      "id": 3,
      "pharmacyId": 101,
      "drugId": 4,
      "quantity": 10,
      "expiryDate": "2025-11-20",
      "originalPrice": 600,
      "discountPrice": 300,
      "status": "Available"
    },
    {
      "id": 4,
      "pharmacyId": 103,
      "drugId": 3,
      "quantity": 200,
      "expiryDate": "2026-08-01",
      "originalPrice": 45,
      "discountPrice": 40,
      "status": "Available"
    }
  ],
  "users": [
    {
      "id": 1,
      "name": "Dr. Ahmed",
      "email": "pharmacy@test.com",
      "password": "123",
      "role": "pharmacy",
      "license": "12345"
    },
    {
      "id": 2,
      "name": "Sarah User",
      "email": "patient@test.com",
      "password": "123",
      "role": "patient"
    }
  ]
}
// --- AUTHENTICATION LOGIC ---

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  const user = db.users.find((u) => u.email === email && u.password === password);
  if (!user) {
    alert("Invalid email or password.");
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(user));
  window.location.href = user.role === "pharmacy" ? "dashboard.html" : "index.html";
}

function handleSignup(event) {
  event.preventDefault();
  const email = document.getElementById("emailInput").value;
  const role = document.getElementById("roleInput").value;
  const name = `${document.getElementById("firstName").value} ${
    document.getElementById("lastName").value
  }`;

  if (db.users.find((u) => u.email === email)) {
    alert("Email already exists.");
    return;
  }

  const newUser = {
    id: db.users.length + 1,
    name: name,
    email: email,
    password: document.getElementById("passwordInput").value,
    role: role,
    license: role === "pharmacy" ? document.getElementById("licenseInput").value : null,
  };

  if (role === "pharmacy") {
    newUser.license = document.getElementById("licenseInput").value;
  }

  db.users.push(newUser);
  localStorage.setItem("currentUser", JSON.stringify(newUser));

  window.location.href = role === "pharmacy" ? "dashboard.html" : "index.html";
}

function checkAuthStatus() {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return;

  const user = JSON.parse(userStr);
  const navAuthSection = document.querySelector(".navbar-nav .ms-lg-3");

  if (navAuthSection) {
    navAuthSection.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-person-circle me-2"></i>${user.name}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    ${
                      user.role === "pharmacy"
                        ? '<li><a class="dropdown-item" href="dashboard.html">Dashboard</a></li>'
                        : ""
                    }
                    <li><a class="dropdown-item" href="#">Profile</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="logout()">Logout</a></li>
                </ul>
            </div>
        `;
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

// --- UTILITIES ---

function getExpiryStatus(dateString) {
  const today = new Date();
  const expiry = new Date(dateString);
  const diffMonths = (expiry - today) / (1000 * 60 * 60 * 24 * 30);

  if (diffMonths <= 3)
    return {
      label: "Critical",
      class: "expiry-critical",
      text: "Expires soon",
    };
  if (diffMonths <= 6)
    return { label: "Warning", class: "expiry-warning", text: "Expires < 6mo" };
  return { label: "Good", class: "expiry-good", text: "Long Expiry" };
}

function formatCurrency(amount) {
  return `${amount} EGP`;
}

// --- RENDER LOGIC ---

function renderListings(containerId, limit = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let listings = db.listings;
  if (limit) listings = listings.slice(0, limit);

  container.innerHTML = listings
    .map((listing) => {
      const drug = db.drugs.find((d) => d.id === listing.drugId);
      const pharmacy = db.pharmacies.find((p) => p.id === listing.pharmacyId);
      const expiryStatus = getExpiryStatus(listing.expiryDate);

      return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <span class="expiry-badge ${expiryStatus.class}">${
        expiryStatus.text
      }</span>
                            <small class="text-muted">${
                              pharmacy.distance
                            }</small>
                        </div>
                        <h5 class="card-title mb-1">${drug.name}</h5>
                        <p class="text-muted small mb-3">${drug.generic}</p>
                        
                        <div class="d-flex align-items-center mb-3">
                            <i class="bi bi-geo-alt me-2 text-primary-blue"></i>
                            <small>${pharmacy.name}</small>
                        </div>

                        <div class="d-flex justify-content-between align-items-end mt-3">
                            <div>
                                <small class="text-muted text-decoration-line-through d-block">${formatCurrency(
                                  listing.originalPrice
                                )}</small>
                                <span class="text-secondary-green fw-bold fs-5">${formatCurrency(
                                  listing.discountPrice
                                )}</span>
                            </div>
                            <button class="btn btn-sm btn-outline-primary" onclick="alert('Reserving ${
                              drug.name
                            } from ${pharmacy.name}')">Reserve</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    })
    .join("");
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // 1. Check if user is logged in and update UI
  checkAuthStatus();

  // 2. Bind Login Form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // 3. Bind Signup Form
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }

  // 4. Render Listings (only if on a page that needs them)
  if (
    document.getElementById("featured-listings") ||
    document.getElementById("all-listings")
  ) {
    renderListings("featured-listings", 4);
    renderListings("all-listings");
  }
});
