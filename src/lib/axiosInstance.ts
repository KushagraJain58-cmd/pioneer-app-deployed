// // import axios from 'axios';
// // import * as SecureStore from 'expo-secure-store';

// // const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8100';

// // const axiosInstance = axios.create({ baseURL: BASE_URL });

// // axiosInstance.interceptors.request.use(async (config) => {
// //   const token = await SecureStore.getItemAsync('token');
// //   if (token) {
// //     config.headers.Authorization = `Bearer ${token}`;
// //   }
// //   return config;
// // });

// // export default axiosInstance;


// import axios from 'axios';
// import * as SecureStore from 'expo-secure-store';

// const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8100';

// const axiosInstance = axios.create({
//   baseURL: BASE_URL,
// });

// // Request Interceptor
// axiosInstance.interceptors.request.use(
//   async (config) => {
//     const token = await SecureStore.getItemAsync('token');

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     console.log('🚀 API Request');
//     console.log({
//       method: config.method?.toUpperCase(),
//       url: `${config.baseURL}${config.url}`,
//       params: config.params,
//       data: config.data,
//       headers: config.headers,
//     });

//     return config;
//   },
//   (error) => {
//     console.error('❌ Request Error:', error);
//     return Promise.reject(error);
//   }
// );

// // Response Interceptor
// axiosInstance.interceptors.response.use(
//   (response) => {
//     console.log('✅ API Response');
//     console.log({
//       status: response.status,
//       url: response.config.url,
//       method: response.config.method?.toUpperCase(),
//       data: response.data,
//     });

//     return response;
//   },
//   (error) => {
//     console.error('❌ API Error');

//     if (error.response) {
//       console.error({
//         status: error.response.status,
//         url: error.config?.url,
//         method: error.config?.method?.toUpperCase(),
//         data: error.response.data,
//       });
//     } else {
//       console.error(error.message);
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;


import { apiLogger } from '@/src/helper/apiLogger';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8100';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}

    const fullUrl = `${config.baseURL}${config.url}`;

    apiLogger.request({
      url: fullUrl,
      method: config.method?.toUpperCase(),
      headers: config.headers,
      body: config.data,
      params: config.params,
    });

    return config;
  },
  (error) => {
    apiLogger.error({
      message: error.message,
    });

    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => {
    const fullUrl = `${response.config.baseURL}${response.config.url}`;

    apiLogger.success({
      url: fullUrl,
      method: response.config.method?.toUpperCase(),
      status: response.status,
      headers: response.headers,
      data: response.data,
    });

    return response;
  },
  (error) => {
    const fullUrl = `${error.config?.baseURL}${error.config?.url}`;

    apiLogger.error({
      url: fullUrl,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      headers: error.response?.headers,
      data: error.response?.data,
      message: error.message,
    });

    return Promise.reject(error);
  }
);

export default axiosInstance;