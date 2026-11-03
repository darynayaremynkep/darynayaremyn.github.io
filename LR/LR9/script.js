
// Отримання елементів сторінки
const loader = document.getElementById("loader");
const result = document.getElementById("result");

// Відображення результату та лоадера
function execute(promise) {
    loader.style.display = "block";
    result.innerHTML = "Очікування результату...";

    promise
        .then(message => {
            result.innerHTML = message;
        })
        .catch(error => {
            result.innerHTML = "Помилка: " + error;
        })
        .finally(() => {
            loader.style.display = "none";
        });
}

// Завдання 1
function task1() {
    const promise = new Promise((resolve) => {
        setTimeout(() => {
            resolve("Hello, World!");
        }, 2000);
    });

    execute(promise);
}

// Завдання 2
function checkNumber(num) {
    return new Promise((resolve, reject) => {
        if (num > 10) {
            resolve("Число " + num + " більше 10");
        } else {
            reject("Число " + num + " менше або дорівнює 10");
        }
    });
}

function task2() {
    const promise = Promise.all([
        checkNumber(15)
            .then(message => message)
            .catch(error => error),

        checkNumber(7)
            .then(message => message)
            .catch(error => error)
    ]);

    execute(
        promise.then(messages => messages.join("<br>"))
    );
}

// Завдання 3
function randomNumber() {
    return new Promise((resolve) => {
        const startTime = Date.now();

        const delay = Math.floor(Math.random() * 2000) + 1000;

        setTimeout(() => {
            const number = Math.floor(Math.random() * 100) + 1;
            const time = ((Date.now() - startTime) / 1000).toFixed(2);

            resolve({
                number: number,
                time: time
            });
        }, delay);
    });
}

function task3() {
    const promise = randomNumber().then(data => {
        return "Випадкове число: " + data.number +
               "<br>Час виконання: " + data.time + " секунд";
    });

    execute(promise);
}

// Завдання 4
function compareNumbers(num1, num2) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (num1 > num2) {
                resolve("Перше число більше");
            } else if (num1 < num2) {
                resolve("Друге число більше");
            } else {
                reject("Числа рівні");
            }
        }, 1000);
    });
}

function task4() {
    const promise = compareNumbers(15, 10);
    execute(promise);
}

// Завдання 5
function task5() {
    const promises = [
        new Promise(resolve => {
            setTimeout(() => {
                resolve(Math.floor(Math.random() * 10) + 1);
            }, 1000);
        }),

        new Promise(resolve => {
            setTimeout(() => {
                resolve(Math.floor(Math.random() * 10) + 1);
            }, 2000);
        }),

        new Promise(resolve => {
            setTimeout(() => {
                resolve(Math.floor(Math.random() * 10) + 1);
            }, 3000);
        })
    ];

    const promise = Promise.all(promises).then(numbers => {
        const sum = numbers.reduce((total, number) => total + number, 0);

        return "Отримані числа: " + numbers.join(", ") +
               "<br>Сума всіх чисел: " + sum;
    });

    execute(promise);
}
