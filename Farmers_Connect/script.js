/*Hides all form sections in the register-container.*/
function hideAllForms() {
    const formSections = document.querySelectorAll('.form-section, #role-selection');
    formSections.forEach(section => section.classList.add("hidden"));
}

/*Redirects the user based on their role.*/
function goHome() {
    const userRole = sessionStorage.getItem("userRole");
    if (userRole === "consumer") {
        window.location.href = "index.html"; 
    } else if (userRole === "farmer") {
        window.location.href = "farmer-dashboard.html"; 
    } else {
        window.location.href = "index.html"; 
    }
}

/*Logs the user out by clearing session storage and redirecting.*/
function logoutUser() {
    sessionStorage.removeItem("loggedInUser");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("selectedRole");
    window.location.href = "register.html";
}

// Authentication & Profile Management Functions

/**
 * Shows the appropriate login/signup forms based on the selected role.
 * @param {string} role - 'consumer' or 'farmer'
 */
function selectRole(role) {
    hideAllForms();
    sessionStorage.setItem("selectedRole", role);
    if (role === 'consumer') {
        showConsumerLogin();
    } else if (role === 'farmer') {
        showFarmerLogin();
    }
}

/* Returns to the initial role selection screen.*/
function backToRoleSelection() {
    hideAllForms();
    sessionStorage.removeItem("selectedRole");
    document.getElementById("role-selection").classList.remove("hidden");
    document.getElementById("section-title").textContent = "Login / Register";
}

// --- Consumer Form Functions ---
function showConsumerLogin() {
    hideAllForms();
    document.getElementById("consumer-login-form").classList.remove("hidden");
    document.getElementById("section-title").textContent = "Consumer Login";
}

function showConsumerSignUp() {
    hideAllForms();
    document.getElementById("consumer-signup-form").classList.remove("hidden");
    document.getElementById("section-title").textContent = "Consumer Sign Up";
}

// --- Farmer Form Functions ---
function showFarmerLogin() {
    hideAllForms();
    document.getElementById("farmer-login-form").classList.remove("hidden");
    document.getElementById("section-title").textContent = "Farmer Login";
}

function showFarmerSignUp() {
    hideAllForms();
    document.getElementById("farmer-signup-form").classList.remove("hidden");
    document.getElementById("section-title").textContent = "Farmer Sign Up";
}

function showUpdateForm() {
    const loggedInUser = sessionStorage.getItem("loggedInUser");
    const userRole = sessionStorage.getItem("userRole");
    const currentPage = window.location.pathname.split('/').pop();

    if (!loggedInUser) {
        alert("Please login to view or update your profile.");
        window.location.href = "register.html";
        return;
    }

    if (currentPage !== "register.html") {
        sessionStorage.setItem("showUpdateProfileOnLoad", "true");
        window.location.href = "register.html";
        return;
    }

    hideAllForms();
    const updateFormElement = document.getElementById("update-form");
    if (updateFormElement) {
        updateFormElement.classList.remove("hidden");
    }

    document.getElementById("profile-username").value = loggedInUser;
    
    let title = "Update Profile";
    if (userRole === "consumer") {
        title = "Update Consumer Profile";
    } else if (userRole === "farmer") {
        title = "Update Farmer Profile";
    }

    const sectionTitleElement = document.getElementById("section-title");
    if (sectionTitleElement) {
        sectionTitleElement.textContent = title;
    }
    const updateFormTitleElement = document.getElementById("update-form-title");
    if (updateFormTitleElement) {
        updateFormTitleElement.textContent = title; 
    }

    fetch("PHP/get_profile_details.php?role=" + userRole + "&username=" + encodeURIComponent(loggedInUser))
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById("profile-email").value = data.email;
            } else {
                console.error("Failed to fetch profile details:", data.message);
                document.getElementById("profile-email").value = '';
                alert("Failed to load profile details. " + data.message);
            }
        })
        .catch(error => console.error("Error fetching profile details:", error));
}


// --- API Interaction (Login, Signup, Update) ---

function loginConsumer() {
    const username = document.getElementById("consumer-login-username").value.trim();
    const password = document.getElementById("consumer-login-password").value.trim();

    if (!username || !password) {
        alert("Please enter username and password.");
        return;
    }

    fetch("PHP/login_consumer.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    })
    .then(res => res.text())
    .then(response => {
        if (response.toLowerCase().includes("successful")) {
            sessionStorage.setItem("loggedInUser", username);
            sessionStorage.setItem("userRole", "consumer");
            window.location.href = "index.html"; 
        } else {
            alert(response); 
        }
    })
    .catch(err => {
        console.error("Consumer Login error:", err);
        alert("Consumer login failed due to server error.");
    });
}

function loginFarmer() {
    const farmName = document.getElementById("farmer-login-farmname").value.trim(); 
    const password = document.getElementById("farmer-login-password").value.trim();
  
    if (!farmName || !password) {
        alert("Please enter Farm Name and password.");
        return;
    }
  
    fetch("PHP/login_farmer.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `farmname=${encodeURIComponent(farmName)}&password=${encodeURIComponent(password)}`
    })
    .then(res => res.text())
    .then(response => {
        if (response.toLowerCase().includes("successful")) {
            sessionStorage.setItem("loggedInUser", farmName); 
            sessionStorage.setItem("userRole", "farmer");
            window.location.href = "farmer-dashboard.html"; 
        } else {
            alert(response); 
        }
    })
    .catch(err => {
        console.error("Farmer Login error:", err);
        alert("Farmer login failed due to server error.");
    });
}

function signUpConsumer() {
    const username = document.getElementById("consumer-signup-username").value.trim();
    const email = document.getElementById("consumer-signup-email").value.trim();
    const password = document.getElementById("consumer-signup-password").value.trim();

    if (!username || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    fetch("PHP/register_consumer.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    })
    .then(res => res.text())
    .then(response => {
        alert(response);
        if (response.toLowerCase().includes("successful")) {
            showConsumerLogin(); 
        }
    })
    .catch(err => {
        console.error("Consumer Signup error:", err);
        alert("Consumer signup failed due to server error.");
    });
}

function signUpFarmer() {
    const farmName = document.getElementById("farmer-signup-farmname").value.trim();
    const email = document.getElementById("farmer-signup-email").value.trim();
    const password = document.getElementById("farmer-signup-password").value.trim();
  
    if (!farmName || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }
  
    fetch("PHP/register_farmer.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `farmname=${encodeURIComponent(farmName)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    })
    .then(res => res.text())
    .then(response => {
        alert(response);
        if (response.toLowerCase().includes("successful")) {
            showFarmerLogin(); 
        }
    })
    .catch(err => {
        console.error("Farmer Signup error:", err);
        alert("Farmer signup failed due to server error.");
    });
}

function updateProfile() {
    const username = document.getElementById("profile-username").value.trim();
    const email = document.getElementById("profile-email").value.trim();
    const password = document.getElementById("profile-password").value.trim();

    if (!email) {
        alert("Email is required.");
        return;
    }

    const userRole = sessionStorage.getItem("userRole");
    let apiUrl = "";
    const formData = new URLSearchParams();
    
    // Always include email.
    formData.append('email', email);

    // Add password only if the field is not empty.
    if (password) {
        formData.append('password', password);
    }

    if (userRole === 'farmer') {
        // Use PHP/ subfolder and 'farmname' identifier
        apiUrl = 'PHP/update_farmer_profile.php';
        formData.append('farmname', username); 
    } else if (userRole === 'consumer') {
        // Use PHP/ subfolder and 'username' identifier
        apiUrl = 'PHP/update_consumer_profile.php'; 
        formData.append('username', username); 
    } else {
        alert("Could not determine user role. Please log in again.");
        return;
    }

    // --- Execute Fetch Request ---
    fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
    })
    .then(res => res.text())
    .then(response => {
        alert(response);
        // Clear password field after successful attempt
        document.getElementById("profile-password").value = '';
    })
    .catch(err => {
        console.error("Profile Update error:", err);
        alert("Profile Update failed due to a network or server error.");
    });
}

// Cart & Product Management

function addToCart(productName, productPrice) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let existingProduct = cart.find(item => item.name === productName);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ name: productName, price: productPrice, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${productName} has been added to your cart!`);
    updateCart();
}

function updateCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let cartItems = document.getElementById('cart-items');
    if (!cartItems) return;
    cartItems.innerHTML = '';
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        let cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <p>${item.name} x ${item.quantity}</p>
            <p>₹${item.price * item.quantity}</p>
            <button onclick="removeFromCart(${index})">Remove</button>
        `;
        cartItems.appendChild(cartItem);
    });
    cartItems.innerHTML += `<h4>Total: ₹${total}</h4>`;
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

function checkout() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    document.getElementById("checkout-popup").classList.remove("hidden");
    let cartPopup = document.getElementById("cart-popup");
    if (cartPopup) {
        cartPopup.innerHTML = '';
        cart.forEach(item => {
            cartPopup.innerHTML += `<p>${item.name} x ${item.quantity} - ₹${item.price * item.quantity}</p>`;
        });
    }
}

function hideCheckout() {
    document.getElementById("checkout-popup").classList.add("hidden");
}

function showPaymentOptions() {
    const method = document.getElementById("payment").value;
    document.getElementById("card-details").classList.add("hidden");
    document.getElementById("upi-qr").classList.add("hidden");
    if (method === "card") {
        document.getElementById("card-details").classList.remove("hidden");
    } else if (method === "upi") {
        document.getElementById("upi-qr").classList.remove("hidden");
    }
}


function placeOrder() {
    const name = document.getElementById("checkout-name").value.trim();
    const phone = document.getElementById("checkout-phone").value.trim();
    const address = document.getElementById("checkout-address").value.trim();
    const payment = document.getElementById("payment").value;
    if (!name || !phone || !address || (payment === "card" && !document.getElementById("card-number").value.trim())) {
        alert("Please complete all required fields.");
        return;
    }
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
        alert("Cart is empty.");
        return;
    }
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const loggedInUser = sessionStorage.getItem("loggedInUser"); 

    fetch("PHP/place_order.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ 
            username: loggedInUser,
            name,
            phone,
            address,
            products: cart,
            total,
            payment
        })
    })
    .then(res => res.text())
    .then(response => {
        alert(response); 
        if (response.toLowerCase().includes("successful")) { 
            localStorage.removeItem("cart");
            updateCart();
            hideCheckout();
        }
    })
    .catch(err => {
        console.error("Order error:", err);
        alert("Order failed. Try again.");
    });
}

function sortByCategory() {
    const selectedCategory = document.getElementById('category-select').value;
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (selectedCategory === 'all' || category === selectedCategory) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}


function updateNavigation() {
    const navLinksContainer = document.querySelector('nav .nav-links');
    const loggedInUser = sessionStorage.getItem("loggedInUser");
    const userRole = sessionStorage.getItem("userRole");

    if (!navLinksContainer) {
        console.error("Navigation links container not found.");
        return;
    }
    navLinksContainer.innerHTML = '';

    if (loggedInUser && userRole) {
        // --- User is Logged In ---
        if (userRole === 'consumer') {
            const homeLink = document.createElement('li');
            homeLink.innerHTML = `<a href="index.html">Home</a>`;
            navLinksContainer.appendChild(homeLink);

            const aboutUsLink = document.createElement('li');
            aboutUsLink.innerHTML = `<a href="about.html">About Us</a>`;
            navLinksContainer.appendChild(aboutUsLink);

            const productsLink = document.createElement('li');
            productsLink.innerHTML = `<a href="products.html">Products</a>`;
            navLinksContainer.appendChild(productsLink);

            const cartLink = document.createElement('li');
            cartLink.innerHTML = `<a href="cart.html">Cart</a>`;
            navLinksContainer.appendChild(cartLink);

            const profileLink = document.createElement('li');
            profileLink.innerHTML = `<a href="#" onclick="showUpdateForm()">My Profile</a>`;
            navLinksContainer.appendChild(profileLink);

            const logoutLink = document.createElement('li');
            logoutLink.innerHTML = `<a href="#" onclick="logoutUser()">Logout</a>`;
            navLinksContainer.appendChild(logoutLink);

        } else if (userRole === 'farmer') {
            const dashboardLink = document.createElement('li');
            dashboardLink.innerHTML = `<a href="farmer-dashboard.html">Dashboard</a>`;
            navLinksContainer.appendChild(dashboardLink);

            const contactUsLink = document.createElement('li');
            contactUsLink.innerHTML = `<a href="contact-us.html">Contact Us</a>`;
            navLinksContainer.appendChild(contactUsLink);

            const profileLink = document.createElement('li');
            profileLink.innerHTML = `<a href="#" onclick="showUpdateForm()">My Profile</a>`;
            navLinksContainer.appendChild(profileLink);
            
            const logoutLink = document.createElement('li');
            logoutLink.innerHTML = `<a href="#" onclick="logoutUser()">Logout</a>`;
            navLinksContainer.appendChild(logoutLink);
        }
    } 
    else {
        const registerLink = document.createElement('li');
        registerLink.innerHTML = `<a href="register.html">Register</a>`;
        navLinksContainer.appendChild(registerLink);
    }
}

// Initialization Logic

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    const loggedInUser = sessionStorage.getItem("loggedInUser");
    const userRole = sessionStorage.getItem("userRole");
    const selectedRoleOnPageLoad = sessionStorage.getItem("selectedRole");
    const showUpdateProfileOnLoad = sessionStorage.getItem("showUpdateProfileOnLoad");


    // --- Update Navigation Bar on every page load ---
    updateNavigation();

    // --- Global Redirect if not logged in (and not on register.html) ---
    if (!loggedInUser && currentPage !== "register.html") {
        alert("Please login to access this page.");
        window.location.href = "register.html";
        return; 
    }

    // --- Logic specific to register.html ---
    if (currentPage === "register.html") {
        if (showUpdateProfileOnLoad === "true") {
            sessionStorage.removeItem("showUpdateProfileOnLoad"); 
            showUpdateForm();
        } else if (loggedInUser) {
            showUpdateForm();
        } else if (selectedRoleOnPageLoad) {
            if (selectedRoleOnPageLoad === "consumer") {
                showConsumerLogin();
            } else if (selectedRoleOnPageLoad === "farmer") {
                showFarmerLogin();
            }
        } else {
            document.getElementById("role-selection").classList.remove("hidden");
            document.getElementById("section-title").textContent = "Login / Register";
        }
    }

    // --- Logic specific to cart.html ---
    if (currentPage === "cart.html") {
        if (userRole === 'farmer') { // Prevent farmers from accessing cart directly
            alert("Farmers do not have a shopping cart. Redirecting to dashboard.");
            window.location.href = "farmer-dashboard.html";
            return;
        }
        updateCart();
    }

    // --- Logic specific to farmer-dashboard.html ---
    if (currentPage === "farmer-dashboard.html") {
        if (userRole !== 'farmer' || !loggedInUser) {
            alert("Please login as a farmer to access the dashboard.");
            window.location.href = "register.html";
            return;
        }
        // This part can remain for initial dashboard detail population
        const dashboardFarmname = document.getElementById('dashboard-farmname');
        const displayFarmName = document.getElementById('display-farm-name');
        const displayFarmerEmail = document.getElementById('display-farmer-email');

        if (dashboardFarmname) dashboardFarmname.textContent = loggedInUser;
        if (displayFarmName) displayFarmName.textContent = loggedInUser;

        if (displayFarmerEmail) {
            fetch("PHP/get_profile_details.php?role=farmer&username=" + encodeURIComponent(loggedInUser))
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        displayFarmerEmail.textContent = data.email;
                    } else {
                        console.error("Failed to fetch farmer details:", data.message);
                        displayFarmerEmail.textContent = "N/A";
                    }
                })
                .catch(error => {
                    console.error("Error fetching farmer details:", error);
                    displayFarmerEmail.textContent = "Error";
                });
        }
    }

    // Redirect farmers if they try to access consumer-specific pages
    const consumerPages = ["index.html", "products.html", "cart.html"];
    if (userRole === "farmer" && consumerPages.includes(currentPage)) {
        alert("Farmers cannot access consumer shopping pages. Redirecting to dashboard.");
        window.location.href = "farmer-dashboard.html";
        return;
    }
});

// Weather Widget Specific JavaScript

const apiKey = "3c0999c07ecdfe3d48a9760d44faf4a4";

function displayWeather(data) {
    const weatherInfo = document.getElementById("weatherInfo");
    if (!weatherInfo) {
        console.error("weatherInfo element not found!");
        return;
    }

    const { name, main, weather, sys } = data;
    weatherInfo.innerHTML = `
        <h2>${name}, ${sys.country}</h2>
        <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}">
        <p><strong>${weather[0].main}</strong> - ${weather[0].description}</p>
        <p>🌡️ Temp: ${main.temp} °C</p>
        <p>💧 Humidity: ${main.humidity}%</p>
    `;
}

function getWeatherByCity() {
    const cityInput = document.getElementById("cityInput");
    if (!cityInput) {
        console.error("cityInput element not found!");
        return;
    }
    const city = cityInput.value.trim();
    if (!city) {
        alert("Please enter a city name.");
        return;
    }
    fetchWeather(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
}

function getWeatherByLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    document.getElementById("weatherInfo").innerHTML = "<p>Getting your location...</p>";
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        fetchWeather(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
    }, (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location. Please ensure location services are enabled and permissions are granted.");
        document.getElementById("weatherInfo").innerHTML = "<p>Error getting location.</p>";
    });
}

function fetchWeather(url) {
    const weatherInfo = document.getElementById("weatherInfo");
    if (!weatherInfo) {
        console.error("weatherInfo element not found!");
        return;
    }
    weatherInfo.innerHTML = "<p>Fetching weather data...</p>";
    fetch(url)
        .then(res => {
            if (!res.ok) { 
                return res.json().then(errorData => Promise.reject(errorData));
            }
            return res.json();
        })
        .then(data => {
            if (data.cod && data.cod !== 200) {
                weatherInfo.innerHTML = `<p>Error: ${data.message}</p>`;
            } else {
                displayWeather(data);
            }
        })
        .catch(error => {
            console.error("Error fetching weather:", error);
            weatherInfo.innerHTML = `<p>Error fetching data: ${error.message || 'Check city name or network.'}</p>`;
        });
}

document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
    
    if (document.getElementById('dashboard-farmname')) {
        document.getElementById('dashboard-farmname').textContent = "TestFarmer";
    }
});


async function suggestCrop() {
    const nitrogen = document.getElementById('nitrogen').value;
    const phosphorus = document.getElementById('phosphorus').value;
    const potassium = document.getElementById('potassium').value;
    const temperature = document.getElementById('temperature').value;
    const humidity = document.getElementById('humidity').value;
    const ph = document.getElementById('ph').value;
    const rainfall = document.getElementById('rainfall').value;

    if (!nitrogen || !phosphorus || !potassium || !temperature || !humidity || !ph || !rainfall) {
        alert('Please fill in all the fields.');
        return;
    }

    const resultDiv = document.getElementById('suggestion-result');
    const cropOutputList = document.getElementById('crop-output-list');
    
    cropOutputList.innerHTML = "<li>Analyzing conditions...</li>";
    resultDiv.classList.remove('hidden');
    
    const data = {
        'N': parseFloat(nitrogen), 'P': parseFloat(phosphorus), 'K': parseFloat(potassium),
        'temperature': parseFloat(temperature), 'humidity': parseFloat(humidity),
        'ph': parseFloat(ph), 'rainfall': parseFloat(rainfall)
    };

    try {
        const response = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();

        cropOutputList.innerHTML = "";
        result.predictions.forEach(crop => {
            const cropName = crop.charAt(0).toUpperCase() + crop.slice(1);
            const listItem = document.createElement('li');
            const img = document.createElement('img');
            img.src = `images/crops/${crop.toLowerCase()}.png?t=${new Date().getTime()}`;
            img.alt = cropName;

            const span = document.createElement('span');
            span.textContent = cropName;

            listItem.appendChild(img);
            listItem.appendChild(span);
            
            cropOutputList.appendChild(listItem);
        });

    } catch (error) {
        console.error('Error fetching prediction:', error);
        cropOutputList.innerHTML = "<li>Error: Could not connect to the server.</li>";
        alert('Could not get a prediction. Please ensure the backend server is running and try again.');
    }
}