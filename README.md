# Secure Checkout — Manual Payment Page

A professional, mobile-friendly payment page that collects payments **manually** via:

- 🏦 **Bank Transfer** (dropdown for multiple accounts/regions)
- 💳 **PayPal** (PayPal.me button + email)
- ₿ **Crypto** (dropdown for coins, address copy button + QR code)
- 🎁 **Gift Card** (dropdown for card types)

The page is a **multi-step flow** (Details → Method → Pay → Confirm → Thank You) so the
payer never sees all options crammed on one screen, and ends with a personalized
**thank-you note** once they submit their payment confirmation.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure (5 steps) |
| `styles.css` | All styling — brand colors at the top (`:root`) |
| `script.js` | Logic + **your payment details** |

## ✏️ How to customize (required)

Open `script.js` and edit the `CONFIG` object at the top:

- `businessName`, `supportEmail`, `verificationWindow`
- `paypal.paypalMeUrl` and `paypal.accountEmail`
- `bankAccounts` — add/remove regions, fill in real account numbers
- `cryptoWallets` — paste your real wallet addresses
- `giftCards` list and `giftCardEmail`

That's it — everything else updates automatically.

## 🚀 How to publish (get your payment link)

It's a static site — host it free in minutes:

1. **Netlify Drop** — drag this folder onto <https://app.netlify.com/drop>
2. **Vercel** — `vercel` in this folder, or import the repo
3. **GitHub Pages** — push the folder to a repo → Settings → Pages

You'll get a URL like `https://yourbusiness.netlify.app` — that's your payment link.

## ⚠️ Notes

- This is a **static** page: the confirmation form shows a thank-you screen but does not
  email you submissions by itself. To receive confirmations by email, connect the step-4
  form to a free form backend like [Formspree](https://formspree.io) or
  [Web3Forms](https://web3forms.com).
- Payments are verified manually by you before delivering goods/services.
