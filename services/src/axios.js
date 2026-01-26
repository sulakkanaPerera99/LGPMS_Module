import axios from "axios";

window.axios = axios
// axios.defaults.baseURL = "http://localhost:80/api"
 let backendUrl = "http://" + window.location.hostname.toString() + ":3000/api"
// let backendUrl = "https://apps.matale.dist.gov.lk/api"
// let backendUrl = "https://elgservices.lk/api"
//
axios.defaults.baseURL = backendUrl
axios.defaults.withCredentials = false;


// //Automatically attach JWT token to every request
// axios.interceptors.request.use(
//   (config) => {
//     const token = sessionStorage.getItem("authToken");
    
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Handle 401 Unauthorized globally
// axios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       sessionStorage.removeItem("authToken");
//       sessionStorage.removeItem("userData");
//       alert("Session expired. Please log in again.");
//       window.location.href = "/login"; // redirect to login
//     }
//     return Promise.reject(error);
//   }
// );

window.axios = axios; // optional: make axios global