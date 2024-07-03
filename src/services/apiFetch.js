import extractJSON from "../utils/extractJSON.js";
import { getTokenAPi } from "./getTokenApi.js";

const endpoints = extractJSON({ path: "../configs/endpoints.json" });
const initialQuery = "?q=";

export const apiFetch = async ({ type, option = false, body }) => {
  const url = endpoints[type]["url"];
  let parameters;

  if (type === "search") {
    parameters = initialQuery;
    const entries = Object.entries(body);

    entries.forEach(([prop, value], index) => {
      const part = `${encodeURIComponent(prop)}=${encodeURIComponent(value)}`;
      if (index === 0) {
        parameters += value;
      } else {
        parameters += `&${part}`;
      }
    });
  } else {
    parameters = `${body["id"]}${!option ? "" : `/${option}`}`;
  }

  try {
    const accessToken = await getTokenAPi();
    const response = await fetch(`${url}${parameters}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    return result;
  } catch (error) {
    console.log(
      `Hubo un error al hacer la peticion a la API. Error: ${error.message}`
    );
    return { error: error.message };
  }
};
