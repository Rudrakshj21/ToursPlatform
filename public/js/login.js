import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alerts';
export const login = async (email, password) => {
  try {
    // console.log(email, password);
    
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    // console.log(res);
    if (res.data.status == 'success') {
      // window.alert('logged in successfully!');
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        window.location.replace('/');
      }, 2500);
    }
  } catch (error) {
    // console.log('err');
    // window.alert(error.response.data.message);
    showAlert('error', error.response.data.message);
    // console.log(error.response.data);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully');
      window.location.replace('/');
    } else {
      showAlert('error', 'cannot logout.....');
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
