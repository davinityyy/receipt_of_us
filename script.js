// These functions can stay if planned to re-use them later,
// but right now they should not be called or auto-run.

function renderHeader(data) {
  document.querySelector('.receipt-header').innerHTML = `
    <div>${data.title}</div>
    <div>${data.location}</div>
  `;
}

function renderMeta(data) {
  document.querySelector('.receipt-meta').textContent = `${data.date}  ${data.time}`;
}

function renderTransactions(txArray) {
  const container = document.querySelector('.receipt-info');
  container.innerHTML = '';
  txArray.forEach(tx => {
    const line = document.createElement('div');
    line.className = 'receipt-line-block';
    line.textContent = `${tx.action} – ${tx.description}`.toUpperCase();
    container.appendChild(line);
  });
}

function renderTotals(items) {
  const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
  const tax = items.find(i => i.type === 'tax')?.amount || 0;
  const total = subtotal;

  document.querySelector('.subtotal').innerHTML = `
    <div>Subtotal: $${subtotal.toFixed(2)}</div>
    <div>Tax:   $${tax.toFixed(2)}</div>
    <div>Total:  $${total.toFixed(2)}</div>
  `;
}

function renderFooter(lines) {
  document.querySelector('.thankyou').innerHTML =
    lines.map(line => `<div>${line}</div>`).join('');
}

// === Date + Time auto-fill ===
const now = new Date();
const dateEl = document.getElementById('date-field');
const timeEl = document.getElementById('time-field');

const formattedDate = now.toLocaleDateString('en-US');
const formattedTime = now.toLocaleTimeString('en-US', {
  hour: '2-digit',
  minute: '2-digit',
});

if (dateEl) dateEl.textContent = formattedDate;
if (timeEl) timeEl.textContent = formattedTime;

// === Auto-resize logic ===
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

// === Max line enforcement logic ===
function enforceLineLimit(el, maxLines = 5) {
  let lastValidValue = el.value;

  const update = () => {
    const dummy = document.createElement('div');
    dummy.style.position = 'absolute';
    dummy.style.visibility = 'hidden';
    dummy.style.whiteSpace = 'pre-wrap';
    dummy.style.font = getComputedStyle(el).font;
    dummy.style.width = el.offsetWidth + 'px';
    dummy.textContent = el.value;
    document.body.appendChild(dummy);

    const approxLines = Math.ceil(
      dummy.offsetHeight / parseFloat(getComputedStyle(el).lineHeight)
    );

    document.body.removeChild(dummy);

    if (approxLines > maxLines) {
      el.value = lastValidValue;
      el.blur(); // optional: visual feedback
    } else {
      lastValidValue = el.value;
    }
  };

  el.addEventListener('input', update);
  el.addEventListener('keydown', update);
  el.addEventListener('paste', update);
}

// === Apply to existing textareas ===
document.querySelectorAll('textarea.editable').forEach(textarea => {
  textarea.addEventListener('input', () => autoResize(textarea));
  autoResize(textarea);
  enforceLineLimit(textarea, 5);
});

// === Add new line on click with resize + limit ===
const addLineBtn = document.getElementById('add-line-btn');
const receiptInfo = document.querySelector('.receipt-info');

addLineBtn.addEventListener('click', () => {
  const newLine = document.createElement('textarea');
  newLine.className = 'editable receipt-line-block';
  newLine.placeholder = '[NEW LINE ITEM]';
  newLine.rows = 1;
  newLine.required = true;

  newLine.addEventListener('input', () => autoResize(newLine));
  autoResize(newLine);
  enforceLineLimit(newLine, 5);

  receiptInfo.appendChild(newLine);
  newLine.focus();
});
