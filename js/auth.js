function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  const user = db.users.find(
    (u) => u.email === email && u.password === password
  );
  if (!user) {
    showToast("Invalid email or password.", "error");
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(user));

  const licensedRoles = ["pharmacy", "hospital", "doctor"];
  if (licensedRoles.includes(user.role)) {
    // Check if user has active subscription
    if (user.subscription && user.subscription.status === "active") {
      window.location.href = "dashboard.html";
    } else {
      window.location.href = "packages.html";
    }
  } else {
    window.location.href = "marketplace.html";
  }
}

function handleSignup(event) {
  event.preventDefault();
  const email = document.getElementById("emailInput").value;
  const role = document.getElementById("roleInput").value;
  const name = `${document.getElementById("firstName").value} ${document.getElementById("lastName").value
    }`;

  if (db.users.find((u) => u.email === email)) {
    showToast("Email already exists.", "error");
    return;
  }

  const licensedRoles = ["pharmacy", "hospital", "doctor"];
  const isLicensed = licensedRoles.includes(role);

  let businessId = 101 + db.pharmacies.length;

  const newUser = {
    id: db.users.length + 1,
    name: name,
    email: email,
    password: document.getElementById("passwordInput").value,
    role: role,
    license: isLicensed ? document.getElementById("licenseInput").value : null,
    pharmacyId: isLicensed ? businessId : null,
    subscription: null, // New users start without subscription
  };

  if (isLicensed) {
    const businessName = document.getElementById("businessNameInput").value;
    const location = document.getElementById("locationInput").value;
    const newBusiness = {
      id: businessId,
      name: businessName,
      location: location,
      type: role, // pharmacy, hospital, or doctor
    };
    db.pharmacies.push(newBusiness);
    saveDb();
  }

  db.users.push(newUser);
  saveDb();
  localStorage.setItem("currentUser", JSON.stringify(newUser));

  // Redirect based on role
  if (isLicensed) {
    // Licensed users go to packages page to select subscription
    window.location.href = "packages.html";
  } else {
    // Patients go directly to marketplace
    window.location.href = "marketplace.html";
  }
}

function checkAuthStatus() {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return;

  const user = JSON.parse(userStr);
  const navAuthSection = document.querySelector(".navbar-nav .ms-lg-3");
  const licensedRoles = ["pharmacy", "hospital", "doctor"];
  const isLicensed = licensedRoles.includes(user.role);

  if (navAuthSection) {
    navAuthSection.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-person-circle me-2"></i>${user.name}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    ${isLicensed
        ? '<li><a class="dropdown-item" href="dashboard.html"><i class="bi bi-speedometer2 me-2"></i>Dashboard</a></li>'
        : ""
      }
                    <li><a class="dropdown-item" href="marketplace.html"><i class="bi bi-shop me-2"></i>Marketplace</a></li>
                    ${isLicensed
        ? '<li><a class="dropdown-item" href="packages.html"><i class="bi bi-box-seam me-2"></i>My Subscription</a></li>'
        : ""
      }
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="logout()"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                </ul>
            </div>
        `;
  }

  // Hide "Home" nav link for logged-in users
  const homeLink = document.querySelector('.navbar-nav .nav-link[href="index.html"]');
  if (homeLink) {
    homeLink.style.display = 'none';
  }

  // Update brand link based on user role
  const brandLink = document.querySelector('.navbar-brand');
  if (brandLink) {
    brandLink.href = isLicensed ? 'dashboard.html' : 'marketplace.html';
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}
