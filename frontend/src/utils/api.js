const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '' : '${API_BASE_URL}');

export default API_BASE_URL;
