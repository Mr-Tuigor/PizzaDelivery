import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, // This replaces credentials: "include"
  headers: {
    "Content-Type": "application/json",
  },
});

export async function api(endpoint, options = {}) {
  try {
    const res = await API({
      url: endpoint,
      method: options.method || "GET",
      headers: options.headers,
      data: options.body, // Axios uses 'data' instead of 'body'
    });

    return res.data; // Axios automatically parses JSON
  } catch (error) {
    // Axios puts the server error response in error.response
    const message = error.response?.data?.message || "Something went wrong";
    throw new Error(message);
  }
}
