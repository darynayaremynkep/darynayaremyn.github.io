
const products = [
    { id: 1, name: "М'який ведмедик", price: 450, emoji: "🧸" },
    { id: 2, name: "Машинка дитяча", price: 280, emoji: "🚗" },
    { id: 3, name: "Дитячий пазл", price: 190, emoji: "🧩" },
    { id: 4, name: "Набір для малювання", price: 320, emoji: "🎨" },
    { id: 5, name: "Дитячий рюкзак", price: 590, emoji: "🎒" },
    { id: 6, name: "Дитяча ковдра", price: 420, emoji: "👶" }
];

// Отримання корзини з localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];

let selectedProduct = null;

// Збереження корзини
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
}

// Оновлення кількості найменувань біля іконки корзини
function updateCartCount() {
    const count = document.getElementById("cart-count");

    if (count) {
        count.textContent = cart.length;
    }
}

// Відкриття модального вікна
function openQuantityModal(productId) {
    selectedProduct = products.find(product => product.id === productId);

    document.getElementById("quantity").value = 1;
    document.getElementById("modal").style.display = "flex";
}

// Закриття модального вікна
function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// Додавання товару до корзини
function addToCart() {
    const quantity = Number(document.getElementById("quantity").value);

    if (!Number.isInteger(quantity) || quantity < 1) {
        alert("Вкажіть коректну кількість товару!");
        return;
    }

    const existingProduct = cart.find(
        item => item.id === selectedProduct.id
    );

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

    document.getElementById("success-modal").style.display = "flex";
}

// Закриття вікна успішного додавання
function closeSuccessModal() {
    document.getElementById("success-modal").style.display = "none";
}

// Закриття повідомлення про порожню корзину
function closeEmptyModal() {
    const modal = document.getElementById("empty-modal");

    if (modal) {
        modal.style.display = "none";
    }
}

// Перевірка корзини при натисканні на іконку
function handleCartClick(event) {
    if (cart.length === 0) {
        event.preventDefault();

        let modal = document.getElementById("empty-modal");

        if (!modal) {
            modal = document.createElement("div");
            modal.id = "empty-modal";
            modal.className = "modal";

            modal.innerHTML = `
                <div class="modal-content">
                    <h2>Корзина пуста 🛒</h2>
                    <p>Додайте товари, щоб оформити замовлення.</p>
                    <button onclick="closeEmptyModal()">Зрозуміло</button>
                </div>
            `;

            document.body.appendChild(modal);
        }

        modal.style.display = "flex";
    }
}

// Відображення товарів у корзині
function renderCart() {
    const container = document.getElementById("cart-content");

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h2>Ваша корзина поки порожня</h2>
                <p>Знайдіть щось цікаве для свого малюка!</p>
                <a href="index.html" class="modal-button">
                    Перейти до покупок
                </a>
            </div>
        `;

        return;
    }

    let html = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>№</th>
                    <th>Назва товару</th>
                    <th>Ціна за од.</th>
                    <th>К-сть</th>
                    <th>Сума</th>
                    <th>Дія</th>
                </tr>
            </thead>
            <tbody>
    `;

    let total = 0;

    cart.forEach((item, index) => {
        const sum = item.price * item.quantity;
        total += sum;

        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.emoji} ${item.name}</td>
                <td>${item.price} грн</td>
                <td>
                    <input
                        type="number"
                        class="cart-quantity"
                        min="1"
                        value="${item.quantity}"
                        onchange="changeQuantity(${item.id}, this.value)"
                    >
                </td>
                <td>${sum} грн</td>
                <td>
                    <button
                        class="delete-button"
                        onclick="removeProduct(${item.id})"
                    >
                        Видалити
                    </button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>

        <div class="cart-total">
            Разом до оплати: ${total} грн
        </div>
    `;

    container.innerHTML = html;
}

// Зміна кількості товару
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

// Видалення товару
function removeProduct(id) {
    cart = cart.filter(item => item.id !== id);

    saveCart();
    renderCart();
}

// Оплата замовлення
function payForOrder() {
    if (cart.length === 0) {
        alert("Корзина пуста!");
        return;
    }

    alert("Дякуємо за замовлення! Оплату успішно оформлено.");

    cart = [];

    saveCart();
    renderCart();
}

// Обробка натискання на іконку корзини
document.querySelectorAll(".cart-link").forEach(link => {
    link.addEventListener("click", handleCartClick);
});

// Початкове оновлення сторінки
updateCartCount();
renderCart();
