const hostname = window.location.hostname;
const backendHost = (!hostname || hostname === 'localhost') ? '127.0.0.1' : hostname;
export const API_BASE_URL = `http://${backendHost}:5001`;
