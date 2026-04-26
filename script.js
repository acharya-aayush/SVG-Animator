const svgInput = document.getElementById('svgInput');
const previewArea = document.getElementById('previewArea');
const dashSizeInput = document.getElementById('dashSize');
const weightInput = document.getElementById('strokeWeight');
const speedInput = document.getElementById('speed');
const colorInput = document.getElementById('strokeColor');
const codeDisplay = document.getElementById('codeDisplay');
const weightLabel = document.getElementById('weightLabel');
const updateButton = document.getElementById('updateButton');
const resetButton = document.getElementById('resetSample');
const copyButton = document.getElementById('copyButton');
const tabHtml = document.getElementById('tabHtml');
const tabCss = document.getElementById('tabCss');

let currentVariant = 'dash-stroke';
let currentTab = 'html';

function setVariant(variant) {
  currentVariant = variant;
  previewArea.classList.toggle('dash-stroke', variant === 'dash-stroke');
  previewArea.classList.toggle('morph-fill', variant === 'morph-fill');
  tabHtml.textContent = 'HTML';
  tabCss.textContent = 'CSS';
  document.getElementById('variantDash').classList.toggle('active', variant === 'dash-stroke');
  document.getElementById('variantMorph').classList.toggle('active', variant === 'morph-fill');
  updateCodeDisplay();
}

function buildSvgElement(rawSvg) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = rawSvg.trim();
  return wrapper.querySelector('svg');
}

function sanitizeSvg(svg) {
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.setAttribute('viewBox', svg.getAttribute('viewBox') || '0 0 100 100');
  svg.style.width = '220px';
  svg.style.height = '220px';
  return svg;
}

function addMorphLayers(svg) {
  const content = svg.innerHTML;
  svg.innerHTML = `<g class="v2-paths">${content}</g><g class="v2-fill-layer">${content}</g>`;
  svg.querySelectorAll('path, circle, rect, line, polyline, polygon').forEach((element) => {
    if (!element.hasAttribute('pathLength')) {
      element.setAttribute('pathLength', '360');
    }
  });
}

function updateCodeDisplay() {
  const color = colorInput.value;
  const weight = weightInput.value;
  const dash = dashSizeInput.value;
  const speed = speedInput.value;

  if (currentTab === 'html') {
    codeDisplay.textContent = `<div class="loader">\n  ${previewArea.innerHTML.trim()}\n</div>`;
    return;
  }

  if (currentVariant === 'dash-stroke') {
    codeDisplay.textContent = `.loader svg {\n  width: 220px;\n  height: 220px;\n}\n\n.loader svg * {\n  fill: none;\n  stroke: ${color};\n  stroke-width: ${weight}px;\n  stroke-linecap: round;\n  stroke-linejoin: round;\n  stroke-dasharray: ${dash}px;\n  animation: dash-load ${speed}s infinite linear;\n}\n\n@keyframes dash-load {\n  from { stroke-dashoffset: 0; }\n  to { stroke-dashoffset: ${dash * 10}px; }\n}`;
  } else {
    codeDisplay.textContent = `.loader svg {\n  width: 220px;\n  height: 220px;\n  overflow: visible;\n}\n\n.loader .v2-paths * {\n  fill: none;\n  stroke: ${color};\n  stroke-width: ${weight}px;\n  stroke-linecap: round;\n  animation: v2-dashArray ${speed}s ease-in-out infinite,\n    v2-dashOffset ${speed}s linear infinite;\n}\n\n.loader .v2-fill-layer * {\n  fill: ${color};\n  opacity: 0.15;\n  stroke: none;\n  animation: v2-fill-fade ${speed}s ease-in-out infinite;\n}\n\n@keyframes v2-dashArray {\n  0% { stroke-dasharray: 0 1 359 0; }\n  50% { stroke-dasharray: 0 359 1 0; }\n  100% { stroke-dasharray: 359 1 0 0; }\n}\n\n@keyframes v2-dashOffset {\n  from { stroke-dashoffset: -5; }\n  to { stroke-dashoffset: -365; }\n}\n\n@keyframes v2-fill-fade {\n  0%, 100% { opacity: 0.15; }\n  30%, 55% { opacity: 0; }\n}`;
  }
}

function applySVG() {
  const rawSvg = svgInput.value.trim();
  if (!rawSvg) {
    codeDisplay.textContent = 'Insert SVG markup before updating the preview.';
    return;
  }

  const svgElement = buildSvgElement(rawSvg);
  if (!svgElement) {
    codeDisplay.textContent = 'Could not parse the SVG markup. Check that the input contains valid SVG.';
    return;
  }

  sanitizeSvg(svgElement);
  if (currentVariant === 'morph-fill') {
    addMorphLayers(svgElement);
  }

  previewArea.innerHTML = '';
  previewArea.appendChild(svgElement);
  previewArea.style.setProperty('--dash-size', `${dashSizeInput.value}px`);
  previewArea.style.setProperty('--speed', `${speedInput.value}s`);
  previewArea.style.setProperty('--stroke-weight', `${weightInput.value}px`);
  previewArea.style.color = colorInput.value;

  updateCodeDisplay();
}

function copyCode() {
  navigator.clipboard.writeText(codeDisplay.textContent).then(() => {
    copyButton.textContent = 'Copied';
    setTimeout(() => {
      copyButton.textContent = 'Copy code';
    }, 1800);
  });
}

function loadSample() {
  svgInput.value = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">\n  <path d="M31.95 1C15.63 1 2.27 13.69 1 29.82l16.64 6.94c1.41-.98 3.12-1.55 4.95-1.55.17 0 .34.01.5.01l7.4-10.82V24.26c0-6.52 5.25-11.82 11.71-11.82 6.46 0 11.71 5.3 11.71 11.82s-5.25 11.82-11.71 11.82c-.09 0-.18-.002-.27-.004L31.37 43.67c.01.14.01.28.01.42 0 4.89-3.94 8.87-8.79 8.87-4.25 0-7.81-3.07-8.62-7.13L2.07 40.88C5.75 54.03 17.73 63.67 31.95 63.67 49.1 63.67 63 49.64 63 32.34 63 15.03 49.1 1 31.95 1z" />\n</svg>`;
  applySVG();
}

function switchTab(tab) {
  currentTab = tab;
  tabHtml.classList.toggle('active', tab === 'html');
  tabCss.classList.toggle('active', tab === 'css');
  updateCodeDisplay();
}

weightInput.addEventListener('input', () => {
  weightLabel.textContent = `${weightInput.value}px`;
  applySVG();
});

updateButton.addEventListener('click', applySVG);
resetButton.addEventListener('click', loadSample);
copyButton.addEventListener('click', copyCode);
tabHtml.addEventListener('click', () => switchTab('html'));
tabCss.addEventListener('click', () => switchTab('css'));
document.getElementById('variantDash').addEventListener('click', () => setVariant('dash-stroke'));
document.getElementById('variantMorph').addEventListener('click', () => setVariant('morph-fill'));

setVariant('dash-stroke');
loadSample();
