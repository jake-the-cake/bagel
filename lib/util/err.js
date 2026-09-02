import { createError } from "../handle/err.js";

const ERRORS = {
  general404: [404, "There are no files or endpoints found at this URL."],
  getOnly405: [405, "This application only accepts 'GET' requests."],
  default: [500, "An error occurred while processing your request."],
};

function useError(key) {
  return createError(
    ...(Object.keys(ERRORS).includes(key) ? ERRORS[key] : ERRORS["default"]),
  );
}

function useErrorMessage(key) {
  return useError(key).message;
}

export { useError, useErrorMessage };
