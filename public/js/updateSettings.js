import axios from 'axios';
import { showAlert } from './alerts';
// type can be password or data
export const updateSettings = async (data, type) => {
  try {
    const url = `${type == 'password' ? '/api/v1/users/updatePassword' : '/api/v1/users/updateMe'}`;
    const res = await axios({
      url,
      data,
      method: 'PATCH',
    });
    console.log(res);
    if (res.data.status == 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully'`);
      // console.log(res.data);
    } else {
      showAlert('error', res.data);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
    // console.log(error);
  }
};
