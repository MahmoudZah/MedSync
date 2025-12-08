// MedSync Mock Data
// Mock Database
// In browsers, 'require' is not defined. Instead, fetch JSON using fetch API:

const defaultDb = {
  // Subscription Packages
  packages: [
    {
      id: "seller_basic",
      name: "Seller Basic",
      description: "Sell OTC medicines to patients (B2C)",
      priceMonthly: 299,
      priceAnnual: 2990,
      features: ["Sell OTC medicines", "Dashboard access", "Order management"],
      allowsSelling: true,
      allowsB2BBuying: false,
    },
    {
      id: "b2b_pro",
      name: "B2B Pro Bundle",
      description: "Full access: Sell B2C/B2B + Buy restricted medicines",
      priceMonthly: 799,
      priceAnnual: 7990,
      features: [
        "Everything in Seller Basic",
        "Sell to businesses (B2B)",
        "Buy restricted medicines",
        "Priority support",
      ],
      allowsSelling: true,
      allowsB2BBuying: true,
    },
  ],
  drugs: [
    {
      id: 1,
      name: "Augmentin 1g",
      generic: "Amoxicillin/Clavulanic Acid",
      category: "Antibiotics",
      type: "OTC", // Over-the-counter, anyone can buy
      image: "assets/imgs/medicines/augmentin.jpg",
    },
    {
      id: 2,
      name: "Panadol Extra",
      generic: "Paracetamol/Caffeine",
      category: "Pain Killers",
      type: "OTC",
      image: "assets/imgs/medicines/panadol_extra.jpg",
    },
    {
      id: 3,
      name: "Cataflam 50mg",
      generic: "Diclofenac Potassium",
      category: "Pain Killers",
      type: "OTC",
      image: "assets/imgs/medicines/cataflam.jpg",
    },
    {
      id: 4,
      name: "Insulin Lantus",
      generic: "Insulin Glargine",
      category: "Chronic Diseases",
      type: "Restricted", // Only B2B licensed buyers
      image: "assets/imgs/medicines/insulin_lantus.jpg",
    },
    {
      id: 5,
      name: "Concor 5mg",
      generic: "Bisoprolol",
      category: "Chronic Diseases",
      type: "Restricted",
      image: "assets/imgs/medicines/concor.jpg",
    },
    {
      id: 6,
      name: "Morphine 10mg",
      generic: "Morphine Sulfate",
      category: "Controlled Substances",
      type: "Restricted",
      image: "assets/imgs/medicines/morphine.jpg",
    },
    {
      id: 7,
      name: "Tramadol 50mg",
      generic: "Tramadol Hydrochloride",
      category: "Controlled Substances",
      type: "Restricted",
      image: "assets/imgs/medicines/tramadol.jpg",
    },
  ],
  pharmacies: [
    {
      id: 101,
      name: "El Ezaby Pharmacy",
      location: "Maadi, Cairo",
    },
    {
      id: 102,
      name: "Seif Pharmacy",
      location: "Nasr City, Cairo",
    },
  ],
  listings: [
    {
      id: 1,
      pharmacyId: 101,
      drugId: 1,
      quantity: 50,
      expiryDate: "2025-12-01",
      originalPrice: 90,
      discountPrice: 54,
      status: "Available",
      listingType: "B2C", // Available to everyone
    },
    {
      id: 2,
      pharmacyId: 101,
      drugId: 4,
      quantity: 10,
      expiryDate: "2025-12-15",
      originalPrice: 600,
      discountPrice: 300,
      status: "Available",
      listingType: "B2B", // Only for licensed buyers with B2B subscription
    },
    {
      id: 3,
      pharmacyId: 102,
      drugId: 2,
      quantity: 100,
      expiryDate: "2026-03-01",
      originalPrice: 45,
      discountPrice: 30,
      status: "Available",
      listingType: "B2C",
    },
    {
      id: 4,
      pharmacyId: 102,
      drugId: 6,
      quantity: 20,
      expiryDate: "2026-06-01",
      originalPrice: 250,
      discountPrice: 150,
      status: "Available",
      listingType: "B2B",
    },
    {
      id: 5,
      pharmacyId: 101,
      drugId: 7,
      quantity: 30,
      expiryDate: "2026-04-15",
      originalPrice: 180,
      discountPrice: 100,
      status: "Available",
      listingType: "B2B",
    },
  ],
  orders: [
    {
      id: 1,
      pharmacyId: 101,
      buyerId: 2,
      items: [{ listingId: 1, drugId: 1, quantity: 5, price: 54 }],
      total: 270,
      status: "completed",
      createdAt: "2025-11-15T10:30:00Z",
    },
  ],
  users: [
    {
      id: 1,
      name: "Dr. Ahmed",
      email: "pharmacy@test.com",
      password: "123",
      role: "pharmacy",
      license: "12345",
      pharmacyId: 101,
      subscription: { packageId: "b2b_pro", status: "active", billingCycle: "monthly" },
    },
    {
      id: 2,
      name: "Sarah User",
      email: "patient@test.com",
      password: "123",
      role: "patient",
      subscription: null, // Patients don't need subscriptions
    },
    {
      id: 3,
      name: "Dr. Mohamed",
      email: "pharmacy2@test.com",
      password: "123",
      role: "pharmacy",
      license: "67890",
      pharmacyId: 102,
      subscription: { packageId: "seller_basic", status: "active", billingCycle: "annual" },
    },
  ],
};

// Initialize DB from LocalStorage or Default
let db = JSON.parse(localStorage.getItem("medsync_db"));
if (!db) {
  db = defaultDb;
  localStorage.setItem("medsync_db", JSON.stringify(db));
} else {
  // Ensure orders array exists for older saved data
  if (!db.orders) {
    db.orders = [];
    localStorage.setItem("medsync_db", JSON.stringify(db));
  }
}

function saveDb() {
  localStorage.setItem("medsync_db", JSON.stringify(db));
}

// --- UTILITIES ---

function showToast(message, type = "info") {
  // Types: success, error, warning, info
  let backgroundColor;
  switch (type) {
    case "success":
      backgroundColor = "#2ecc71"; // Green
      break;
    case "error":
      backgroundColor = "#e74c3c"; // Red
      break;
    case "warning":
      backgroundColor = "#f1c40f"; // Yellow
      break;
    default:
      backgroundColor = "#3498db"; // Blue
  }

  Toastify({
    text: message,
    duration: 3000,
    gravity: "top", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    backgroundColor: backgroundColor,
    stopOnFocus: true, // Prevents dismissing of toast on hover
  }).showToast();
}

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

// --- USER PERMISSION HELPERS ---

function getCurrentUser() {
  const userStr = localStorage.getItem("currentUser");
  return userStr ? JSON.parse(userStr) : null;
}

function isLicensedRole(role) {
  return ["pharmacy", "hospital", "doctor"].includes(role);
}

function getUserPackage(user) {
  if (!user || !user.subscription || user.subscription.status !== "active") {
    return null;
  }
  return db.packages.find((p) => p.id === user.subscription.packageId);
}

function canUserBuyB2B(user) {
  const pkg = getUserPackage(user);
  return pkg && pkg.allowsB2BBuying;
}

function canUserSell(user) {
  const pkg = getUserPackage(user);
  return pkg && pkg.allowsSelling;
}

// --- RENDER LOGIC ---

function renderListings(containerId, limit = null, listingsData = db.listings) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentUser = getCurrentUser();
  const canBuyB2B = canUserBuyB2B(currentUser);
  const isLicensedUser = currentUser && isLicensedRole(currentUser.role);
  const isPatient = !currentUser || currentUser.role === "patient";

  // Filter listings based on user type
  const today = new Date();
  let listings = listingsData.filter((l) => {
    if (l.quantity <= 0 || l.status === "Sold Out") return false;

    // Filter out expired items
    const expiry = new Date(l.expiryDate);
    if (expiry <= today) return false;

    // Patients should NOT see B2B listings at all
    if (isPatient && l.listingType === "B2B") return false;

    return true;
  });

  if (limit) listings = listings.slice(0, limit);

  if (listings.length === 0) {
    container.innerHTML =
      '<div class="col-12 text-center py-5"><p class="text-muted">No medicines found matching your criteria.</p></div>';
    return;
  }

  container.innerHTML = listings
    .map((listing) => {
      // Use parseInt to handle string/number type mismatch
      const drug = db.drugs.find((d) => d.id === parseInt(listing.drugId));
      let pharmacy = db.pharmacies.find((p) => p.id === parseInt(listing.pharmacyId));

      // If pharmacy not found in db, try to find it from db.users who have that pharmacyId
      if (!pharmacy) {
        const pharmacyUser = db.users.find(u => u.pharmacyId === parseInt(listing.pharmacyId));
        if (pharmacyUser) {
          // Create pharmacy entry and add to db
          pharmacy = {
            id: parseInt(listing.pharmacyId),
            name: pharmacyUser.name || 'Unknown Pharmacy',
            location: 'Unknown'
          };
          db.pharmacies.push(pharmacy);
          saveDb();
        }
      }

      // Skip this listing if drug or pharmacy not found
      if (!drug || !pharmacy) {
        console.warn('Listing skipped - missing drug or pharmacy:', listing);
        return '';
      }

      const expiryStatus = getExpiryStatus(listing.expiryDate);
      const isB2B = listing.listingType === "B2B";

      // Only show blurred for unsubscribed BUSINESSES (not patients)
      const isLockedForBusiness = isB2B && !canBuyB2B && isLicensedUser;

      if (isLockedForBusiness) {
        // Show blurred placeholder for B2B items - ONLY for unsubscribed businesses
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 border-warning position-relative" style="overflow: hidden;">
                    <div style="filter: blur(4px); pointer-events: none;">
                        <img src="${drug.image}" alt="${drug.name}" class="card-img-top" style="height: 200px; object-fit: cover; background: #f0f0f0;" />
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="badge bg-warning text-dark">B2B Exclusive</span>
                                <small class="text-muted">${listing.quantity} left</small>
                            </div>
                            
                            <h5 class="card-title mb-1">${drug.name}</h5>
                            <p class="text-muted small mb-3">${drug.generic}</p>
                            
                            <div class="d-flex align-items-center mb-3">
                                <i class="bi bi-geo-alt me-2 text-primary-blue"></i>
                                <small>${pharmacy.name}</small>
                            </div>

                            <div class="d-flex justify-content-between align-items-end">
                                <div>
                                    <small class="text-muted text-decoration-line-through d-block">${formatCurrency(listing.originalPrice)}</small>
                                    <span class="text-secondary-green fw-bold fs-5">${formatCurrency(listing.discountPrice)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Overlay -->
                    <div class="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center" style="background: rgba(255,255,255,0.85);">
                        <i class="bi bi-lock-fill text-warning fs-1 mb-2"></i>
                        <p class="fw-bold mb-1 text-center px-3">B2B Exclusive Deal</p>
                        <p class="text-muted small text-center px-3 mb-2">Subscribe to B2B Pro to unlock exclusive deals</p>
                        <a href="packages.html" class="btn btn-warning btn-sm">Upgrade to B2B Pro</a>
                    </div>
                </div>
            </div>
        `;
      }

      // Regular visible listing
      return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 ${isB2B ? 'border-warning' : ''}">
                    <img src="${drug.image}" alt="${drug.name}" class="card-img-top" style="height: 200px; object-fit: cover; background: #f0f0f0;" />
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="expiry-badge ${expiryStatus.class}">${expiryStatus.text}</span>
                            <small class="text-muted">${listing.quantity} left</small>
                        </div>
                        ${isB2B ? '<div class="mb-2"><span class="badge bg-warning text-dark"><i class="bi bi-briefcase-fill me-1"></i>B2B Only</span></div>' : ''}
                        
                        <h5 class="card-title mb-1">${drug.name}</h5>
                        <p class="text-muted small mb-3">${drug.generic}</p>
                        
                        <div class="d-flex align-items-center mb-3">
                            <i class="bi bi-geo-alt me-2 text-primary-blue"></i>
                            <small>${pharmacy.name}</small>
                        </div>

                        <div class="d-flex justify-content-between align-items-end mt-auto">
                            <div>
                                <small class="text-muted text-decoration-line-through d-block">${formatCurrency(listing.originalPrice)}</small>
                                <span class="text-secondary-green fw-bold fs-5">${formatCurrency(listing.discountPrice)}</span>
                            </div>
                            <button class="btn btn-sm btn-outline-primary" onclick="openReserveModal(${listing.id})">Reserve</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    })
    .join("");
}

// Render Ad Placeholder Section for patients and unsubscribed businesses
function renderAdPlaceholders(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentUser = getCurrentUser();
  const hasActiveSubscription = currentUser && currentUser.subscription && currentUser.subscription.status === "active";

  // Show ads for: patients, guests, or businesses without active subscription
  if (hasActiveSubscription) {
    container.style.display = "none";
    return;
  }

  container.style.display = "block";
  container.innerHTML = `
    <div class="row g-3">
      <!-- Ad 1: Health Insurance -->
      <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 180px;">
          <div class="card-body d-flex flex-column justify-content-between">
            <div>
              <span class="badge bg-light text-dark mb-2">Ad</span>
              <h6 class="fw-bold mb-1">HealthGuard Insurance</h6>
              <p class="small mb-0 opacity-75">Protect your family with comprehensive health coverage starting at 299 EGP/month</p>
            </div>
            <a href="#" class="btn btn-light btn-sm mt-2 align-self-start">Learn More</a>
          </div>
        </div>
      </div>
      <!-- Ad 2: Vitamin Supplement -->
      <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; min-height: 180px;">
          <div class="card-body d-flex flex-column justify-content-between">
            <div>
              <span class="badge bg-light text-dark mb-2">Ad</span>
              <h6 class="fw-bold mb-1">VitaBoost Daily</h6>
              <p class="small mb-0 opacity-75">Complete multivitamin for immunity. 30% OFF this month!</p>
            </div>
            <a href="#" class="btn btn-light btn-sm mt-2 align-self-start">Shop Now</a>
          </div>
        </div>
      </div>
      <!-- Ad 3: Pharmacy App -->
      <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; min-height: 180px;">
          <div class="card-body d-flex flex-column justify-content-between">
            <div>
              <span class="badge bg-light text-dark mb-2">Ad</span>
              <h6 class="fw-bold mb-1">PharmaExpress Delivery</h6>
              <p class="small mb-0 opacity-75">Get medicines delivered to your door in 30 minutes. Free delivery on first order!</p>
            </div>
            <a href="#" class="btn btn-light btn-sm mt-2 align-self-start">Download App</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Render Google Ads style sidebar/bottom banner
function renderGoogleAdBanner(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentUser = getCurrentUser();
  const hasActiveSubscription = currentUser && currentUser.subscription && currentUser.subscription.status === "active";

  if (hasActiveSubscription) {
    container.style.display = "none";
    return;
  }

  container.style.display = "block";
  container.innerHTML = `
    <div class="card border-0 shadow-sm" style="background: #f8f9fa;">
      <div class="card-body p-3">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <span class="text-muted small"><i class="bi bi-info-circle me-1"></i>Advertisement</span>
          <span class="badge bg-secondary" style="font-size: 0.65rem;">Ads</span>
        </div>
        <div class="text-center p-3" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 8px;">
          <p class="text-white fw-bold mb-1" style="font-size: 0.9rem;">🏥 MediCare Plus</p>
          <p class="text-light small mb-2" style="opacity: 0.8;">Premium healthcare plans for your family</p>
          <a href="#" class="btn btn-warning btn-sm">Get 50% Off</a>
        </div>
      </div>
    </div>
  `;
}

// Render horizontal bottom ad banner
function renderBottomAdBanner(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentUser = getCurrentUser();
  const hasActiveSubscription = currentUser && currentUser.subscription && currentUser.subscription.status === "active";

  if (hasActiveSubscription) {
    container.style.display = "none";
    return;
  }

  container.style.display = "block";
  container.innerHTML = `
    <div class="card border-0 shadow" style="background: linear-gradient(90deg, #00b4db 0%, #0083b0 100%);">
      <div class="card-body py-3">
        <div class="row align-items-center">
          <div class="col-auto">
            <span class="badge bg-white text-dark">Ad</span>
          </div>
          <div class="col">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div class="text-white">
                <span class="fw-bold">💊 PharmaDirect</span>
                <span class="ms-2 opacity-75">Free delivery on orders above 200 EGP!</span>
              </div>
              <a href="#" class="btn btn-light btn-sm">Order Now</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function applyFilters() {
  const location = document.getElementById("locationFilter").value;
  const searchInput = document.getElementById("searchInput");
  const search = searchInput ? searchInput.value.toLowerCase() : "";

  const expiryCheckboxes = document.querySelectorAll(".expiry-filter:checked");
  const expiryValues = Array.from(expiryCheckboxes).map((cb) =>
    parseInt(cb.value)
  );

  const categoryCheckboxes = document.querySelectorAll(
    ".category-filter:checked"
  );
  const categories = Array.from(categoryCheckboxes).map((cb) => cb.value);

  const today = new Date();
  const filtered = db.listings.filter((listing) => {
    // Filter out sold out and expired items
    if (listing.quantity <= 0 || listing.status === "Sold Out") return false;
    const expiry = new Date(listing.expiryDate);
    if (expiry <= today) return false;

    const drug = db.drugs.find((d) => d.id === parseInt(listing.drugId));
    let pharmacy = db.pharmacies.find((p) => p.id === parseInt(listing.pharmacyId));

    // If pharmacy not found, try to create from user with that pharmacyId
    if (!pharmacy) {
      const pharmacyUser = db.users.find(u => u.pharmacyId === parseInt(listing.pharmacyId));
      if (pharmacyUser) {
        pharmacy = {
          id: parseInt(listing.pharmacyId),
          name: pharmacyUser.name || 'Unknown Pharmacy',
          location: 'Unknown'
        };
        db.pharmacies.push(pharmacy);
        saveDb();
      }
    }

    // Skip if drug or pharmacy not found
    if (!drug || !pharmacy) return false;

    // Location Filter
    if (location && !pharmacy.location.includes(location)) return false;

    // Search Filter
    if (
      search &&
      !drug.name.toLowerCase().includes(search) &&
      !drug.generic.toLowerCase().includes(search)
    )
      return false;

    // Category Filter
    if (categories.length > 0 && !categories.includes(drug.category))
      return false;

    // Expiry Filter
    if (expiryValues.length > 0) {
      const today = new Date();
      const expiry = new Date(listing.expiryDate);
      const diffMonths = (expiry - today) / (1000 * 60 * 60 * 24 * 30);

      let matchesExpiry = false;
      if (expiryValues.includes(3) && diffMonths <= 3) matchesExpiry = true;
      if (expiryValues.includes(6) && diffMonths > 3 && diffMonths <= 6)
        matchesExpiry = true;

      if (!matchesExpiry) return false;
    }

    return true;
  });

  renderListings("all-listings", null, filtered);
}

function handleHomeSearch() {
  const input = document.getElementById("homeSearchInput");
  if (input && input.value.trim()) {
    window.location.href = `marketplace.html?search=${encodeURIComponent(
      input.value.trim()
    )}`;
  }
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
    // On marketplace page, we might filter based on URL params, so we wait for step 6
    if (!document.getElementById("searchInput")) {
      renderListings("all-listings");
    }
  }

  // 5. Render Ad Placeholders (for patients and unsubscribed businesses)
  if (document.getElementById("ad-placeholders")) {
    renderAdPlaceholders("ad-placeholders");
  }

  // 6. Render Google Ads (sidebar and bottom banner)
  if (document.getElementById("google-ad-sidebar")) {
    renderGoogleAdBanner("google-ad-sidebar");
  }
  if (document.getElementById("bottom-ad-banner")) {
    renderBottomAdBanner("bottom-ad-banner");
  }

  // Render Cart if on cart page
  if (document.getElementById("cart-items")) {
    renderCart();
  }

  // Update cart count on load
  updateCartCount();

  // 5. Bind Filters
  const applyFiltersBtn = document.getElementById("applyFiltersBtn");
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", applyFilters);
  }

  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", applyFilters);
  }

  // 6. Handle URL Search Params (for Marketplace)
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get("search");
  const searchInput = document.getElementById("searchInput");

  if (searchInput && searchParam) {
    searchInput.value = searchParam;
    applyFilters();
  } else if (document.getElementById("all-listings")) {
    // If no search param, render all
    renderListings("all-listings");
  }

  // 7. Bind Home Search
  const homeSearchBtn = document.getElementById("homeSearchBtn");
  if (homeSearchBtn) {
    homeSearchBtn.addEventListener("click", handleHomeSearch);
  }

  // Allow pressing Enter in home search
  const homeInput = document.getElementById("homeSearchInput");
  if (homeInput) {
    homeInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleHomeSearch();
    });
  }

  // Dashboard Initialization
  if (document.getElementById("inventoryTableBody")) {
    renderDashboard();
    // Populate Add Batch Modal Drugs
    const select = document.getElementById("newDrugId");
    if (select) {
      select.innerHTML = db.drugs
        .map((d) => `<option value="${d.id}">${d.name}</option>`)
        .join("");
    }
    // Set minimum date for expiry (tomorrow)
    const expiryInput = document.getElementById("newExpiryDate");
    if (expiryInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expiryInput.min = tomorrow.toISOString().split('T')[0];
    }
    // Reset discount calculation when modal closes
    const addBatchModal = document.getElementById("addBatchModal");
    if (addBatchModal) {
      addBatchModal.addEventListener('hidden.bs.modal', function () {
        document.getElementById("addBatchForm").reset();
        document.getElementById("discountCalculation").style.display = "none";
      });
    }
    // Update orders badge
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      const pendingOrders = db.orders.filter(
        (o) => o.pharmacyId === user.pharmacyId && o.status === "pending"
      );
      const ordersBadge = document.getElementById("ordersBadge");
      if (ordersBadge) {
        ordersBadge.textContent = pendingOrders.length;
        ordersBadge.style.display =
          pendingOrders.length > 0 ? "inline" : "none";
      }
    }
  }
});
