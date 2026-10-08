// Replace with the real backend URL when it exists.
const CONTACT_ENDPOINT = 'https://jsonplaceholder.typicode.com/posts';

const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const payload = {
    name: data.get('name'),
    email: data.get('email'),
    message: data.get('message'),
  };

  submitBtn.disabled = true;
  statusEl.textContent = '';

  try {
    const response = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    statusEl.textContent = 'Thanks, your message was sent.';
    form.reset();
  } catch (error) {
    statusEl.textContent = 'Sorry, something went wrong. Please try again.';
  } finally {
    submitBtn.disabled = false;
  }
});
