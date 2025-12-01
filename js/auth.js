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
  window.location.href =
    user.role === "pharmacy" ? "dashboard.html" : "marketplace.html";
}

function handleSignup(event) {
  event.preventDefault();
  const email = document.getElementById("emailInput").value;
  const role = document.getElementById("roleInput").value;
  const name = `${document.getElementById("firstName").value} ${
    document.getElementById("lastName").value
  }`;

  if (db.users.find((u) => u.email === email)) {
    showToast("Email already exists.", "error");
    return;
  }
  let pharmacyId = 101 + db.pharmacies.length;

  const newUser = {
    id: db.users.length + 1,
    name: name,
    email: email,
    password: document.getElementById("passwordInput").value,
    role: role,
    license:
      role === "pharmacy"
        ? document.getElementById("licenseInput").value
        : null,
    pharmacyId: role === "pharmacy" ? pharmacyId : null,
  };
  if (role === "pharmacy") {
    const pharmacyName = document.getElementById("pharmacyNameInput").value;
    const location = document.getElementById("locationInput").value;
    const newPharmacy = {
      id: pharmacyId,
      name: pharmacyName,
      location: location,
    };
    db.pharmacies.push(newPharmacy);
    saveDb();

  }


  db.users.push(newUser);
  saveDb();
  localStorage.setItem("currentUser", JSON.stringify(newUser));

  window.location.href = role === "pharmacy" ? "dashboard.html" : "marketplace.html";
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
                        ? '<li><a class="dropdown-item" href="dashboard.html"><i class="bi bi-speedometer2 me-2"></i>Dashboard</a></li> <li><a class="dropdown-item" href="marketplace.html"><i class="bi bi-shop me-2"></i>Marketplace</a></li> <li><hr class="dropdown-divider"></li>'
                        : ""
                    }
                    
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
    brandLink.href = user.role === 'pharmacy' ? 'dashboard.html' : 'marketplace.html';
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}
