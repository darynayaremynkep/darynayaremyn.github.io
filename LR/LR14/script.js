let products = [];
let translations = {};
let currentLang = localStorage.getItem("userLanguage") || null;

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let selectedProduct = null;


async function loadProducts() {
    try {
        const response = await fetch("products.json");
        const data = await response.json();

        translations = data.translations || {};
        products = data.products || [];

        if (!currentLang) {
            const langModal = document.getElementById("language-modal");
            if (langModal) {
                langModal.style.display = "flex";
            }
        } else {
            setLanguage(currentLang);
        }
    } catch (error) {
        console.error("Помилка завантаження даних з JSON:", error);
    }
}

function selectInitialLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("userLanguage", lang);
    
    const langModal = document.getElementById("language-modal");
    if (langModal) {
        langModal.style.display = "none";
    }
    
    setLanguage(lang);
}

function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("userLanguage", lang);
    setLanguage(lang);
}

function setLanguage(lang) {
    const langSelect = document.getElementById("language-select");
    if (langSelect) {
        langSelect.value = lang;
    }

    document.documentElement.lang = lang;

    const langData = translations[lang];
    if (langData) {
        if (langData.pageTitle) {
            document.title = langData.pageTitle;
        }

        document.querySelectorAll("[data-i18n]").forEach(elem => {
            const key = elem.getAttribute("data-i18n");
            if (langData[key]) {
                elem.innerHTML = langData[key];
            }
        });
    }

    renderProducts();
    renderCart();
}

function renderProducts() {
    const container = document.querySelector(".products");
    if (!container) return; 

    const lang = currentLang || "uk";
    const btnText = translations[lang]?.addToCart || "Додати у корзину";

    container.innerHTML = products.map(product => {
        const name = (typeof product.name === "object") ? (product.name[lang] || product.name.uk) : product.name;
        const category = (typeof product.category === "object") ? (product.category[lang] || product.category.uk) : product.category;

        return `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${name}" class="product-image">
                </div>
                <span class="category">${category}</span>
                <h3>${name}</h3>
                <p class="price">${product.price} грн</p>
                <button onclick="openQuantityModal(${product.id})">
                    ${btnText}
                </button>
            </div>
        `;
    }).join('');
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = document.getElementById("cart-count");
    if (count) {
        count.textContent = cart.length;
    }
}

function openQuantityModal(productId) {
    selectedProduct = products.find(product => product.id === productId);

    const qtyInput = document.getElementById("quantity");
    const modal = document.getElementById("modal");

    if (qtyInput) qtyInput.value = 1;
    if (modal) modal.style.display = "flex";
}

function closeModal() {
    const modal = document.getElementById("modal");
    if (modal) modal.style.display = "none";
}

function addToCart() {
    const qtyInput = document.getElementById("quantity");
    const quantity = Number(qtyInput ? qtyInput.value : 1);

    if (!Number.isInteger(quantity) || quantity < 1) {
        alert("Вкажіть коректну кількість товару!");
        return;
    }

    const existingProduct = cart.find(item => item.id === selectedProduct.id);

    if (existingProduct) {
        existingProduct.quantity += quantity;
    } else {
        cart.push({
            ...selectedProduct,
            quantity: quantity
        });
    }

    saveCart();
    closeModal();

    const successModal = document.getElementById("success-modal");
    if (successModal) successModal.style.display = "flex";
}

function closeSuccessModal() {
    const successModal = document.getElementById("success-modal");
    if (successModal) successModal.style.display = "none";
}

function closeEmptyModal() {
    const modal = document.getElementById("empty-modal");
    if (modal) modal.style.display = "none";
}

function handleCartClick(event) {
    if (cart.length === 0) {
        event.preventDefault();
        const modal = document.getElementById("empty-modal");
        if (modal) modal.style.display = "flex";
    }
}

function renderCart() {
    const container = document.getElementById("cart-content");
    if (!container) return; 

    const lang = currentLang || "uk";
    const t = translations[lang] || {};

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h2>${t.cartEmptyStateTitle || "Ваша корзина поки порожня"}</h2>
                <p>${t.cartEmptyStateDesc || "Знайдіть щось цікаве для свого малюка!"}</p>
                <a href="index.html" class="modal-button">
                    ${t.continueShopping || "Перейти до покупок"}
                </a>
            </div>
        `;
        return;
    }

    let html = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>${t.tableNum || "№"}</th>
                    <th>${t.tableName || "Назва товару"}</th>
                    <th>${t.tablePrice || "Ціна за од."}</th>
                    <th>${t.tableQty || "К-сть"}</th>
                    <th>${t.tableSum || "Сума"}</th>
                    <th>${t.tableAction || "Дія"}</th>
                </tr>
            </thead>
            <tbody>
    `;

    let total = 0;

    cart.forEach((item, index) => {
        const sum = item.price * item.quantity;
        total += sum;

        const productName = (typeof item.name === "object") 
            ? (item.name[lang] || item.name.uk) 
            : item.name;

        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.emoji || ''} ${productName}</td>
                <td>${item.price} ${t.currency || "грн"}</td>
                <td>
                    <input
                        type="number"
                        class="cart-quantity"
                        min="1"
                        value="${item.quantity}"
                        onchange="changeQuantity(${item.id}, this.value)"
                    >
                </td>
                <td>${sum} ${t.currency || "грн"}</td>
                <td>
                    <button
                        class="delete-button"
                        onclick="removeProduct(${item.id})"
                    >
                        ${t.deleteBtn || "Видалити"}
                    </button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>

        <div class="cart-total">
            ${t.totalPay || "Разом до оплати"}: ${total} ${t.currency || "грн"}
        </div>
    `;

    container.innerHTML = html;
}

function changeQuantity(id, value) {
    const quantity = Number(value);

    if (!Number.isInteger(quantity) || quantity < 1) {
        alert("Кількість повинна бути не менше 1!");
        renderCart();
        return;
    }

    const item = cart.find(product => product.id === id);

    if (item) {
        item.quantity = quantity;
    }

    saveCart();
    renderCart();
}

function removeProduct(id) {
    cart = cart.filter(item => item.id !== id);

    saveCart();
    renderCart();
}

function payForOrder() {
    const lang = currentLang || "uk";
    const t = translations[lang] || {};

    if (cart.length === 0) {
        alert(t.cartEmptyAlert || "Корзина пуста!");
        return;
    }

    alert(t.paySuccess || "Дякуємо за замовлення! Оплату успішно оформлено.");

    cart = [];
    saveCart();
    renderCart();
}

document.querySelectorAll(".cart-link").forEach(link => {
    link.addEventListener("click", handleCartClick);
});

loadProducts();
updateCartCount();