"use strict";
import extractJSON from "../utils/extractJSON.js";
import { configDotenv } from "dotenv";
import Token from "../models/Token.js";

configDotenv();
const endpoints = extractJSON({ path: "../configs/endpoints.json" });
const urlAuthorization = endpoints["token"];

const secretsList = [
  {
    client_id: process.env.CLIENT_ID_1,
    client_secret: process.env.CLIENT_SECRET_1,
  },
  {
    client_id: process.env.CLIENT_ID_2,
    client_secret: process.env.CLIENT_SECRET_2,
  },
  {
    client_id: process.env.CLIENT_ID_3,
    client_secret: process.env.CLIENT_SECRET_3,
  },
  {
    client_id: process.env.CLIENT_ID_4,
    client_secret: process.env.CLIENT_SECRET_4,
  },
];

let currentCredentialIndex = 0;

export const getTokenAPi = async () => {
  const secrets = secretsList[currentCredentialIndex];

  if (!secrets.client_id || !secrets.client_secret) return false;

  const now = new Date();

  const existingToken = await Token.findOne({ clientId: secrets.client_id })
    .sort({ expiresAt: -1 })
    .limit(1);

  if (existingToken && existingToken.expiresAt > now) {
    currentCredentialIndex = (currentCredentialIndex + 1) % secretsList.length;
    return existingToken.token;
  }

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: secrets.client_id,
      client_secret: secrets.client_secret,
    }),
  };

  try {
    const response = await fetch(urlAuthorization, options);
    const result = await response.json();

    if (!result || !result.access_token) {
      console.error("Respuesta inválida o sin token:", result);
      return false;
    }

    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);

    await Token.deleteMany({ clientId: secrets.client_id });
    await Token.create({
      idToken: result.access_token,
      clientId: secrets.client_id,
      token: result.access_token,
      expiresAt: expiresAt,
    });

    currentCredentialIndex = (currentCredentialIndex + 1) % secretsList.length;

    return result.access_token;
  } catch (error) {
    console.error("Hubo un error al obtener o guardar el token", error);
    return false;
  }
};
