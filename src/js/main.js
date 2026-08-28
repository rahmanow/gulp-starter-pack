/**
 * Your application code.
 *
 * Every `.js` file directly inside `src/js/` is bundled into `js/main.js`,
 * after anything in `src/js/libs/`. Files in `src/js/vendor/` are copied
 * verbatim instead, so load those with their own <script> tag.
 */

const year = new Date().getFullYear();
const slot = document.querySelector("[data-year]");

if (slot) {
  slot.textContent = String(year);
}
