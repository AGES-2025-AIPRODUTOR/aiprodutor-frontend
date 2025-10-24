import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://oc39mt8iwi.execute-api.us-east-2.amazonaws.com/dev',
});
