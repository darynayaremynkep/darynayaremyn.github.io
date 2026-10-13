// ==============================
// DOM
// ==============================
const tabsContainer = document.querySelector('#tabs');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

const topLeft = document.querySelector('#top-left');
const topRight = document.querySelector('#top-right');
const bottomRight = document.querySelector('#bottom-right');
const bottomLeft = document.querySelector('#bottom-left');

const topLeftValue = document.querySelector('#top-left-value');
const topRightValue = document.querySelector('#top-right-value');
const bottomRightValue = document.querySelector('#bottom-right-value');
const bottomLeftValue = document.querySelector('#bottom-left-value');

const gapInput = document.querySelector('#gap');
const gapValue = document.querySelector('#gap-value');
const flexDirection = document.querySelector('#flex-direction');

const preview = document.querySelector('#preview');
const previewButton = document.querySelector('#preview-button');
const coordinates = document.querySelector('#coordinates');
const cssCode = document.querySelector('#css-code');

const copyButton = document.querySelector('#copy-button');
const copyMessage = document.querySelector('#copy-message');

const presetForm = document.querySelector('#preset-form');
const presetName = document.querySelector('#preset-name');
const presetError = document.querySelector('#preset-error');

const scrollTopButton = document.querySelector('#scroll-top');

// ==============================
// TABS
// ==============================
function hideTabs() {
  tabs.forEach(function (tab) {
    tab.classList.remove('active');
  });
  tabContents.forEach(function (content) {
    content.classList.remove('active');
  });
}

function showTab(tabName) {
  const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
  const selectedContent = document.querySelector(`[data-content="${tabName}"]`);

  if (selectedTab && selectedContent) {
    selectedTab.classList.add('active');
    selectedContent.classList.add('active');
  }
}

// Делегування подій: один обробник для всіх вкладок.
tabsContainer.addEventListener('click', function (event) {
  const clickedTab = event.target.closest('.tab');

  if (!clickedTab || !tabsContainer.contains(clickedTab)) {
    return;
  }

  console.log('Тип події:', event.type);
  console.log('Target:', event.target);
  console.log('CurrentTarget:', event.currentTarget);

  hideTabs();
  showTab(clickedTab.dataset.tab);
});

// ==============================
// BORDER RADIUS + CSS GENERATOR
// ==============================
function generateBorderRadius() {
  const topLeftRadius = topLeft.value;
  const topRightRadius = topRight.value;
  const bottomRightRadius = bottomRight.value;
  const bottomLeftRadius = bottomLeft.value;

  topLeftValue.textContent = `${topLeftRadius} px`;
  topRightValue.textContent = `${topRightRadius} px`;
  bottomRightValue.textContent = `${bottomRightRadius} px`;
  bottomLeftValue.textContent = `${bottomLeftRadius} px`;
  gapValue.textContent = `${gapInput.value} px`;

  const radius = `${topLeftRadius}px ${topRightRadius}px ${bottomRightRadius}px ${bottomLeftRadius}px`;
  preview.style.borderRadius = radius;
  preview.style.gap = `${gapInput.value}px`;
  preview.style.flexDirection = flexDirection.value;

  cssCode.value =
`.preview {
  border-radius: ${radius};
  gap: ${gapInput.value}px;
  flex-direction: ${flexDirection.value};
}`;
}

[topLeft, topRight, bottomRight, bottomLeft, gapInput].forEach(function (input) {
  input.addEventListener('input', generateBorderRadius);
});

flexDirection.addEventListener('change', generateBorderRadius);

// ==============================
// COPY
// ==============================
async function copyCSS() {
  try {
    await navigator.clipboard.writeText(cssCode.value);
    copyMessage.textContent = 'CSS-код скопійовано';
  } catch (error) {
    // Резервний спосіб, якщо Clipboard API недоступний.
    cssCode.focus();
    cssCode.select();
    const copied = document.execCommand('copy');
    copyMessage.textContent = copied
      ? 'CSS-код скопійовано'
      : 'Не вдалося скопіювати. Виділіть код і скопіюйте вручну.';
  }
}

copyButton.addEventListener('click', copyCSS);

// ==============================
// FORM: focus, blur, submit
// ==============================
presetName.addEventListener('focus', function () {
  presetName.classList.add('focused');
});

presetName.addEventListener('blur', function () {
  presetName.classList.remove('focused');

  if (presetName.value.trim() === '') {
    presetName.classList.add('error');
    presetError.textContent = 'Введіть назву пресета';
  } else {
    presetName.classList.remove('error');
    presetError.textContent = '';
  }
});

function handlePresetSubmit(event) {
  event.preventDefault();

  const name = presetName.value.trim();
  if (name === '') {
    presetName.classList.add('error');
    presetError.textContent = 'Введіть назву пресета';
    presetName.focus();
    return;
  }

  presetName.classList.remove('error');
  presetError.textContent = '';
  console.log(`Пресет: ${name}`);
  console.log(cssCode.value);
  copyMessage.textContent = `Пресет «${name}» сформовано. CSS доступний у полі вище.`;
}

presetForm.addEventListener('submit', handlePresetSubmit);

// ==============================
// KEYBOARD
// ==============================
function handleKeyDown(event) {
  if (event.key === 'Escape') {
    topLeft.value = 0;
    topRight.value = 0;
    bottomRight.value = 0;
    bottomLeft.value = 0;
    gapInput.value = 10;
    flexDirection.value = 'row';
    generateBorderRadius();
  }

  if (event.ctrlKey && event.key === 'Enter') {
    copyCSS();
  }
}

document.addEventListener('keydown', handleKeyDown);

// ==============================
// EVENT PROPAGATION
// ==============================
preview.addEventListener('click', function () {
  console.log('Preview click');
});

previewButton.addEventListener('click', function (event) {
  event.stopPropagation();
  console.log('Button click');
});

// ==============================
// MOUSE EVENTS + COORDINATES
// ==============================
preview.addEventListener('mouseover', function () {
  preview.classList.add('hovered');
});

preview.addEventListener('mouseout', function () {
  preview.classList.remove('hovered');
});

preview.addEventListener('mousemove', function (event) {
  coordinates.textContent = `X: ${event.clientX}; Y: ${event.clientY}`;
  console.log('pageX:', event.pageX, 'pageY:', event.pageY);
});

// ==============================
// SCROLL
// ==============================
function handleScroll() {
  if (window.scrollY > 300) {
    scrollTopButton.classList.add('visible');
  } else {
    scrollTopButton.classList.remove('visible');
  }
}

window.addEventListener('scroll', handleScroll);

scrollTopButton.addEventListener('click', function () {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Initial render
generateBorderRadius();
handleScroll();
