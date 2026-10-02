/* ============================================================
   Secure Checkout — logic
   ------------------------------------------------------------
   ★ EDIT YOUR PAYMENT DETAILS IN THE CONFIG BELOW ★
   ============================================================ */

const CONFIG = {
  businessName: "brainbox_X",
  supportEmail: "support@yourbusiness.com",
  verificationWindow: "24–48 hours",

  /* ---- PayPal ---- */
  paypal: {
    paypalMeUrl: "https://paypal.me/YourUsername",   // your PayPal.me link
    accountEmail: "paypal@yourbusiness.com",         // your PayPal email
    note: "Please send as “Goods & Services” and include your name in the note."
  },

  /* ---- Bank transfer — add/remove accounts as needed ---- */
  bankAccounts: [
    {
      label: "USD — United States",
      bankName: "Your Bank Name",
      accountName: "Your Business Name LLC",
      accountNumber: "000123456789",
      routing: "026009593 (ACH / Wire)",
      swift: "BOFAUS3N",
      referenceHint: "Use your full name as the transfer reference."
    },
    {
      label: "EUR — Europe (SEPA)",
      bankName: "Your Bank Name",
      accountName: "Your Business Name LLC",
      accountNumber: "DE00 0000 0000 0000 0000 00 (IBAN)",
      routing: "—",
      swift: "DEUTDEFF",
      referenceHint: "Use your full name as the transfer reference."
    },
    {
      label: "GBP — United Kingdom",
      bankName: "Your Bank Name",
      accountName: "Your Business Name LLC",
      accountNumber: "12345678",
      routing: "Sort code 04-06-05",
      swift: "—",
      referenceHint: "Use your full name as the transfer reference."
    }
  ],

  /* ---- Crypto wallets — add/remove coins as needed ---- */
  cryptoWallets: [
    { label: "Bitcoin (BTC)",       network: "Bitcoin network",  address: "bc1qYOURBTCADDRESSHERE000000000000000000" },
    { label: "Ethereum (ETH)",      network: "ERC-20",           address: "0xYOURETHADDRESSHERE00000000000000000000" },
    { label: "Tether (USDT)",       network: "TRC-20 (Tron)",    address: "TYOURUSDTTRC20ADDRESSHERE000000000000" },
    { label: "USD Coin (USDC)",     network: "ERC-20",           address: "0xYOURUSDCADDRESSHERE0000000000000000000" },
    { label: "Litecoin (LTC)",      network: "Litecoin network", address: "ltc1qYOURLTCADDRESSHERE00000000000000000" }
  ],

  /* ---- Gift cards ---- */
  giftCards: ["Amazon", "Apple / iTunes", "Google Play", "Steam", "Walmart", "Vanilla Visa / Mastercard"],
  giftCardEmail: "giftcards@yourbusiness.com"
};

/* ============================================================
   Do not edit below this line unless you know what you're doing
   ============================================================ */

const METHOD_NAMES = {
  bank: "Bank Transfer",
  paypal: "PayPal",
  crypto: "Cryptocurrency",
  giftcard: "Gift Card"
};

const REFERENCE_FIELDS = {
  bank:    { label: "Transfer reference / sender name", placeholder: "e.g. Jane Doe — sent 10:30 AM" },
  paypal:  { label: "PayPal transaction ID",            placeholder: "e.g. 8XJ12345AB678901C" },
  crypto:  { label: "Transaction hash (TxID)",          placeholder: "e.g. 0x4f2a… or 9b1c…" },
  giftcard:{ label: "Gift card claim code",             placeholder: "e.g. ABCD-EFGH-IJKL" }
};

const state = {
  name: "", email: "", amount: 0, currency: "USD",
  purpose: "", method: null, reference: "", note: ""
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const esc = (str) =>
  String(str).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const fmtMoney = () =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: state.currency })
    .format(state.amount);

/* ---------- Brand init ---------- */
document.title = `Secure Checkout — ${CONFIG.businessName}`;
$("#brand-name").textContent = CONFIG.businessName;
$("#brand-logo").textContent = CONFIG.businessName.trim().charAt(0).toUpperCase() || "P";
const supportLink = $("#support-email");
supportLink.textContent = CONFIG.supportEmail;
supportLink.href = `mailto:${CONFIG.supportEmail}`;

/* ---------- Step navigation ---------- */
function goTo(step) {
  $$(".step").forEach((el) => el.classList.toggle("is-active", el.id === `step-${step}`));
  $$("#progress .progress__item").forEach((el, i) => {
    el.classList.toggle("is-active", i === step - 1);
    el.classList.toggle("is-done", i < step - 1);
    if (i < step - 1) el.querySelector("i").textContent = "✓";
    else el.querySelector("i").textContent = String(i + 1);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

$$("[data-back]").forEach((btn) =>
  btn.addEventListener("click", () => goTo(Number(btn.dataset.back))));

/* ---------- Step 1: details ---------- */
$("#step-1").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#payer-name").value.trim();
  const email = $("#payer-email").value.trim();
  const amount = parseFloat($("#amount").value);
  const err = $("#err-1");

  if (name.length < 2) { err.textContent = "Please enter your full name."; err.hidden = false; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = "Please enter a valid email address."; err.hidden = false; return; }
  if (!amount || amount <= 0) { err.textContent = "Please enter a valid amount."; err.hidden = false; return; }

  err.hidden = true;
  Object.assign(state, {
    name, email, amount,
    currency: $("#currency").value,
    purpose: $("#purpose").value.trim()
  });
  goTo(2);
});

/* ---------- Step 2: method selection ---------- */
$$(".method").forEach((btn) =>
  btn.addEventListener("click", () => {
    state.method = btn.dataset.method;
    renderInstructions();
    goTo(3);
  }));

/* ---------- Step 3: instructions ---------- */
const row = (label, value, copyable = true) => `
  <div class="row">
    <span class="row__label">${esc(label)}</span>
    <span class="row__value">${esc(value)}</span>
    ${copyable ? `<button class="copy" type="button" data-copy="${esc(value)}">Copy</button>` : ""}
  </div>`;

const warnIcon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>`;

function summaryHTML() {
  const purpose = state.purpose ? `<div><span>For</span> <b>${esc(state.purpose)}</b></div>` : "";
  return `
    <div><span>Amount</span> <b>${fmtMoney()}</b></div>
    <div><span>Method</span> <b>${METHOD_NAMES[state.method]}</b></div>
    ${purpose}`;
}

function renderInstructions() {
  $("#instructions-title").textContent = `Pay with ${METHOD_NAMES[state.method]}`;
  $("#summary-3").innerHTML = summaryHTML();
  const body = $("#instructions-body");

  if (state.method === "bank") {
    body.innerHTML = `
      <label class="field">Select account / region
        <select id="bank-select">
          ${CONFIG.bankAccounts.map((a, i) => `<option value="${i}">${esc(a.label)}</option>`).join("")}
        </select>
      </label>
      <div class="rows" id="bank-rows"></div>
      <div class="notice">${warnIcon}<span>Send exactly <b>${fmtMoney()}</b>. Transfers can take 1–3 business days to arrive.</span></div>`;
    const renderRows = (a) => {
      $("#bank-rows").innerHTML =
        row("Bank", a.bankName) +
        row("Account name", a.accountName) +
        row("Account / IBAN", a.accountNumber) +
        row("Routing / Sort", a.routing) +
        row("SWIFT / BIC", a.swift) +
        row("Reference", a.referenceHint, false);
    };
    renderRows(CONFIG.bankAccounts[0]);
    $("#bank-select").addEventListener("change", (e) => renderRows(CONFIG.bankAccounts[+e.target.value]));
  }

  if (state.method === "paypal") {
    body.innerHTML = `
      <p style="font-size:13.5px;line-height:1.7;color:#334155">
        Send <b>${fmtMoney()}</b> to our PayPal account using the button below, or send directly to the email shown.
      </p>
      <a class="paypal-btn" href="${esc(CONFIG.paypal.paypalMeUrl)}" target="_blank" rel="noopener">
        Pay ${fmtMoney()} via PayPal.me
      </a>
      <div class="rows">${row("PayPal email", CONFIG.paypal.accountEmail)}</div>
      <div class="notice">${warnIcon}<span>${esc(CONFIG.paypal.note)}</span></div>`;
  }

  if (state.method === "crypto") {
    body.innerHTML = `
      <label class="field">Select coin / network
        <select id="crypto-select">
          ${CONFIG.cryptoWallets.map((w, i) => `<option value="${i}">${esc(w.label)} — ${esc(w.network)}</option>`).join("")}
        </select>
      </label>
      <div id="crypto-detail"></div>`;
    const renderWallet = (w) => {
      $("#crypto-detail").innerHTML = `
        <div class="rows">
          ${row("Coin", w.label, false)}
          ${row("Network", w.network, false)}
          ${row("Address", w.address)}
        </div>
        <img class="qr" width="150" height="150" alt="Wallet QR code"
             src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(w.address)}"
             onerror="this.style.display='none'" />
        <p class="qr-caption">Scan to copy address</p>
        <div class="notice">${warnIcon}<span>Send <b>only ${esc(w.label)}</b> on the <b>${esc(w.network)}</b> network. Sending on the wrong network may result in permanent loss of funds.</span></div>`;
    };
    renderWallet(CONFIG.cryptoWallets[0]);
    $("#crypto-select").addEventListener("change", (e) => renderWallet(CONFIG.cryptoWallets[+e.target.value]));
  }

  if (state.method === "giftcard") {
    body.innerHTML = `
      <label class="field">Select gift card type
        <select id="gift-select">
          ${CONFIG.giftCards.map((g) => `<option>${esc(g)}</option>`).join("")}
        </select>
      </label>
      <ol class="list">
        <li>Purchase a <b id="gift-name">${esc(CONFIG.giftCards[0])}</b> gift card worth <b>${fmtMoney()}</b>.</li>
        <li>Keep the receipt and scratch to reveal the claim code.</li>
        <li>Email a clear photo of the card + receipt to <b>${esc(CONFIG.giftCardEmail)}</b>,
            <i>or</i> simply enter the claim code on the next screen.</li>
      </ol>
      <div class="rows">${row("Gift card email", CONFIG.giftCardEmail)}</div>
      <div class="notice">${warnIcon}<span>Physical cards with receipts are verified fastest. E-codes are also accepted.</span></div>`;
    $("#gift-select").addEventListener("change", (e) => { $("#gift-name").textContent = e.target.value; });
  }
}

/* ---------- Copy buttons ---------- */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-copy]");
  if (!btn) return;
  const text = btn.dataset.copy;
  const done = () => {
    btn.textContent = "Copied ✓";
    btn.classList.add("is-copied");
    setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("is-copied"); }, 1600);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(done);
  } else {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (_) {}
    document.body.removeChild(ta); done();
  }
});

/* ---------- Step 3 → 4 ---------- */
$("#paid-btn").addEventListener("click", () => {
  const ref = REFERENCE_FIELDS[state.method];
  $("#ref-label").textContent = ref.label;
  const input = $("#reference");
  input.placeholder = ref.placeholder;
  input.value = "";
  $("#note").value = "";
  $("#summary-4").innerHTML = summaryHTML();
  goTo(4);
});

/* ---------- Step 4: confirm ---------- */
$("#step-4").addEventListener("submit", (e) => {
  e.preventDefault();
  const reference = $("#reference").value.trim();
  const err = $("#err-4");
  if (reference.length < 3) {
    err.textContent = "Please enter a valid reference so we can match your payment.";
    err.hidden = false;
    return;
  }
  err.hidden = true;
  state.reference = reference;
  state.note = $("#note").value.trim();
  renderThanks();
  goTo(5);
});

/* ---------- Step 5: thank you ---------- */
function renderThanks() {
  const firstName = esc(state.name.split(" ")[0]);
  $("#thanks-title").textContent = `Thank you, ${firstName}!`;
  $("#thanks-body").innerHTML =
    `Your payment confirmation for <b>${fmtMoney()}</b> via <b>${METHOD_NAMES[state.method]}</b> has been received. ` +
    `We will verify it manually within <b>${CONFIG.verificationWindow}</b> and email your receipt to <b>${esc(state.email)}</b>.`;
  $("#summary-5").innerHTML = `
    <div><span>Amount</span> <b>${fmtMoney()}</b></div>
    <div><span>Method</span> <b>${METHOD_NAMES[state.method]}</b></div>
    <div><span>Reference</span> <b>${esc(state.reference)}</b></div>`;
  $("#thanks-note").innerHTML =
    `Keep your payment receipt until confirmed. Questions? Email us at
     <a href="mailto:${CONFIG.supportEmail}" style="color:var(--brand-2);font-weight:600">${esc(CONFIG.supportEmail)}</a>.`;
}
