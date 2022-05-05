import axios from "axios";

const backend = config.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL;

export const getClient = () => {
  axios.get(`${backend}/client`).then((response) => {
    console.log("client", response.data);
  });
};

export const sendEmail = (
  emailBody: string,
  emailAttachments: Array<{
    content: string;
    contentType: string;
    encoding: string;
    filename: string;
  }>,
  emailTo: Array<string>
) => {
  axios
    .post(`${backend}/email`, { emailBody, emailAttachments, emailTo })
    .then((response) => {
      console.log("email", response.data);
    })
    .catch((e) => {
      console.log("failed to send email", e);
    });
};
