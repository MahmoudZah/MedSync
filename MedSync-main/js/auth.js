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
  // Check if user is any company type (pharmacy, supplier, hospital)
  const companyRoles = ["pharmacy", "supplier", "hospital"];
  window.location.href = companyRoles.includes(user.role) ? "dashboard.html" : "marketplace.html";
}

function handleSignup(event) {
  event.preventDefault();
  const email = document.getElementById("emailInput").value;
  const role = document.getElementById("roleInput").value;
  const companyType = document.getElementById("companyTypeInput")?.value || "";
  const name = `${document.getElementById("firstName").value} ${document.getElementById("lastName").value}`;

  if (db.users.find((u) => u.email === email)) {
    showToast("Email already exists.", "error");
    return;
  }

  // Ensure companies array exists
  if (!db.companies) {
    db.companies = [];
  }

  // Determine actual role (for company, use the specific company type)
  const actualRole = role === "company" ? companyType : role;
  const companyRoles = ["pharmacy", "supplier", "hospital"];
  const isCompanyRole = companyRoles.includes(actualRole);

  let companyId = isCompanyRole ? 101 + db.companies.length : null;

  const newUser = {
    id: db.users.length + 1,
    name: name,
    email: email,
    password: document.getElementById("passwordInput").value,
    role: actualRole,
    companyId: isCompanyRole ? companyId : null,
  };

  // Create company record for any company type
  if (isCompanyRole) {
    let companyName, location, license, phone, address, companyData;

    if (actualRole === "pharmacy") {
      companyName = document.getElementById("pharmacyName")?.value || "";
      location = document.getElementById("pharmacyLocation")?.value || "";
      license = document.getElementById("pharmacyLicense")?.value || "";
      phone = document.getElementById("pharmacyPhone")?.value || "";
      address = document.getElementById("pharmacyAddress")?.value || "";

      companyData = {
        id: companyId,
        name: companyName,
        type: "pharmacy",
        location: location,
        license: license,
        phone: phone,
        address: address,
      };
      newUser.license = license;
    } else if (actualRole === "supplier") {
      companyName = document.getElementById("supplierName")?.value || "";
      const taxId = document.getElementById("supplierTaxId")?.value || "";
      phone = document.getElementById("supplierPhone")?.value || "";
      const category = document.getElementById("supplierCategory")?.value || "";
      address = document.getElementById("supplierAddress")?.value || "";

      companyData = {
        id: companyId,
        name: companyName,
        type: "supplier",
        taxId: taxId,
        phone: phone,
        category: category,
        address: address,
      };
      newUser.taxId = taxId;
    } else if (actualRole === "hospital") {
      companyName = document.getElementById("hospitalName")?.value || "";
      license = document.getElementById("hospitalLicense")?.value || "";
      const hospitalType = document.getElementById("hospitalType")?.value || "";
      const beds = document.getElementById("hospitalBeds")?.value || "";
      phone = document.getElementById("hospitalPhone")?.value || "";
      location = document.getElementById("hospitalLocation")?.value || "";
      address = document.getElementById("hospitalAddress")?.value || "";

      companyData = {
        id: companyId,
        name: companyName,
        type: "hospital",
        location: location,
        license: license,
        hospitalType: hospitalType,
        beds: beds,
        phone: phone,
        address: address,
      };
      newUser.license = license;
    }

    db.companies.push(companyData);
    saveDb();
  }

  db.users.push(newUser);
  saveDb();
  localStorage.setItem("currentUser", JSON.stringify(newUser));

  window.location.href = isCompanyRole ? "dashboard.html" : "marketplace.html";
}

function checkAuthStatus() {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return;

  const user = JSON.parse(userStr);
  const navAuthSection = document.querySelector(".navbar-nav .ms-lg-3");
  const companyRoles = ["pharmacy", "supplier", "hospital"];
  const isCompanyRole = companyRoles.includes(user.role);

  if (navAuthSection) {
    navAuthSection.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-person-circle me-2"></i>${user.name}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    ${isCompanyRole
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
    brandLink.href = isCompanyRole ? 'dashboard.html' : 'marketplace.html';
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}
