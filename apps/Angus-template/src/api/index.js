import axios from "axios";

axios.defaults.baseURL = 'https://angus-server-6g36j4y8db4fbe91-1306774321.ap-shanghai.app.tcloudbase.com'

const request = {
  get(url, params) {
    return axios.get(url, { params });
  },
  post(url, body) {
    return axios.post(url, body);
  },
};

export default request