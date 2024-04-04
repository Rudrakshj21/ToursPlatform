import { login, logout } from './login';
import { updateSettings } from './updateSettings';
// DOM
const form = document.querySelector('.form--login');
const logoutBtn = document.getElementById('logout');
const formUpdateData = document.querySelector('.form-user-data');
const formUserPassword = document.querySelector('.form-user-password');
// console.log(formUpdateData);
// VALUES

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    // console.log(email, password);
    login(email, password);
  });
}

if (formUpdateData) {
  formUpdateData.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    console.log('form update', form.entries());

    updateSettings(form, 'data');
  });
}
if (formUserPassword) {
  formUserPassword.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn-save-password').textContent = 'Updating.....';
    const currentPassword = document.getElementById('password-current').value;
    const updatePassword = document.getElementById('password').value;
    const updatePasswordConfirm =
      document.getElementById('password-confirm').value;

    // console.log(passwordConfirm, password, passwordConfirm);
    await updateSettings(
      { currentPassword, updatePassword, updatePasswordConfirm },
      'password',
    );
    document.querySelector('.btn-save-password').textContent = 'save password';
    // clear fields after updating settings
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}
