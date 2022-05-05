import axios from "axios";

const backendUrl = config.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL;

export const getClient = () => {
  console.log("env.VITE_BACKEND_URL", import.meta.env.VITE_BACKEND_URL);
  console.log("config.VITE_BACKEND_URL", config.VITE_BACKEND_URL);
  console.log("backendUrl", backendUrl);

  axios.get(`${backendUrl}/client`).then((response) => {
    console.log("client", response.data);
  });
};
