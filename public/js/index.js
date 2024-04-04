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
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    // console.log('form update');
    // const data = {name,email,password};
    updateSettings({ name, email }, 'data');
  });
}
if (formUserPassword) {
  formUserPassword.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('password-current').value;
    const updatePassword = document.getElementById('password').value;
    const updatePasswordConfirm =
      document.getElementById('password-confirm').value;

    // console.log(passwordConfirm, password, passwordConfirm);
    updateSettings(
      { currentPassword, updatePassword, updatePasswordConfirm },
      'password',
    );
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}
