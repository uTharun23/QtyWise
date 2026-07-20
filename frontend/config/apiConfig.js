const hostname = window.location.hostname;
const isLocal = (!hostname || hostname === 'localhost' || hostname === '127.0.0.1');

export const API_BASE_URL = isLocal ? 'http://127.0.0.1:5001' : window.location.origin;
