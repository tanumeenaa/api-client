const STATUS_RULES = {
  400: {
    title: "Bad Request",
    meaning: "The server couldn't understand your request.",
    checks: [
      "Is your JSON body valid (quotes, commas, brackets)?",
      "Are required fields missing or misspelled?",
      "Did you send the right Content-Type header?",
    ],
  },
  401: {
    title: "Unauthorized",
    meaning: "The server received your request but couldn't verify who you are.",
    checks: [
      "Is your token or API key missing?",
      "Has it expired?",
      "Is the Authorization header formatted correctly, for example 'Bearer <token>'?",
    ],
  },
  403: {
    title: "Forbidden",
    meaning: "The server knows who you are, but you aren't allowed to do this.",
    checks: [
      "Does your account have permission for this action?",
      "Is the token for the right user or scope?",
    ],
  },
  404: {
    title: "Not Found",
    meaning: "The server couldn't find what you asked for.",
    checks: [
      "Is the URL path spelled correctly?",
      "Does the resource, such as an ID, actually exist?",
      "Is the base URL correct?",
    ],
  },
  405: {
    title: "Method Not Allowed",
    meaning: "This URL exists, but not for this HTTP method.",
    checks: [
      "Are you using GET where it expects POST, or the reverse?",
      "Check the API docs for the allowed methods.",
    ],
  },
  409: {
    title: "Conflict",
    meaning: "Your request clashes with the current state of the data.",
    checks: ["Are you creating something that already exists, such as a duplicate email?"],
  },
  415: {
    title: "Unsupported Media Type",
    meaning: "The server doesn't accept the format of the data you sent.",
    checks: ["Set the Content-Type header, for example application/json, to match your body."],
  },
  422: {
    title: "Unprocessable Entity",
    meaning: "The request was well formed, but the data failed validation.",
    checks: ["Read the response body: it usually names the field that failed."],
  },
  429: {
    title: "Too Many Requests",
    meaning: "You've hit the server's rate limit.",
    checks: ["Wait a bit and retry.", "Check the Retry-After header if there is one."],
  },
  500: {
    title: "Internal Server Error",
    meaning: "Something broke on the server's side, not necessarily in your request.",
    checks: [
      "Try again in a moment.",
      "If it keeps happening, your input may be triggering a bug. Check the server logs if you own it.",
    ],
  },
  502: {
    title: "Bad Gateway",
    meaning: "A server in the middle got a bad reply from the real server.",
    checks: ["This is usually temporary. Retry later."],
  },
  503: {
    title: "Service Unavailable",
    meaning: "The server is down or overloaded.",
    checks: ["Retry later.", "Check the service's status page."],
  },
  504: {
    title: "Gateway Timeout",
    meaning: "A server in the middle waited too long for the real server.",
    checks: ["Retry later or try a smaller request."],
  },
};

const SUCCESS_NOTES = {
  200: "The request worked and the server sent back data.",
  201: "The request worked and something new was created.",
  202: "The server accepted your request and will process it later.",
  204: "The request worked, and the server has nothing to send back.",
};

export function explainStatus(status, { method, url }) {
  let path = "";
  try {
    path = new URL(url).pathname;
  } catch {
    path = "";
  }

  if (status >= 200 && status < 300) {
    return {
      level: "success",
      title: `${status} Success`,
      meaning: SUCCESS_NOTES[status] || "The request worked.",
      checks: [],
    };
  }

  if (status >= 300 && status < 400) {
    return {
      level: "info",
      title: `${status} Redirect`,
      meaning: "The server is telling you to go to a different URL.",
      checks: ["Look at the 'location' header for the new address and send your request there."],
    };
  }

  const rule = STATUS_RULES[status];

  if (!rule) {
    const kind = status >= 500 ? "a problem on the server" : "a problem with the request";
    return {
      level: "error",
      title: `${status}`,
      meaning: `The server reported ${kind}.`,
      checks: ["Look at the response body for details."],
    };
  }

  const pathHint = status === 404 && path ? [`Check that "${path}" exists on this server.`] : [];
  const methodHint = status === 405 ? [`You sent ${method}. Try a different method.`] : [];

  return {
    level: "error",
    title: `${status} ${rule.title}`,
    meaning: rule.meaning,
    checks: [...pathHint, ...methodHint, ...rule.checks],
  };
}

export function explainNetworkError(err) {
  const code = err.code || "";

  if (code === "ENOTFOUND") {
    return {
      level: "error",
      title: "Server not found",
      meaning: "The domain name couldn't be resolved to an address.",
      checks: ["Check the domain for typos.", "Check your internet connection."],
    };
  }

  if (code === "ECONNREFUSED") {
    return {
      level: "error",
      title: "Connection refused",
      meaning: "Nothing is listening at that address and port.",
      checks: ["Is the server running?", "Is the port number correct?"],
    };
  }

  if (code === "ECONNABORTED" || code === "ETIMEDOUT") {
    return {
      level: "error",
      title: "Request timed out",
      meaning: "The server took too long to respond.",
      checks: ["The server may be slow or down.", "Try again."],
    };
  }

  if (code === "ECONNRESET") {
    return {
      level: "error",
      title: "Connection dropped",
      meaning: "The server closed the connection before finishing its reply.",
      checks: ["Try again.", "The server may have crashed while handling your request."],
    };
  }

  if (code.includes("CERT") || code.includes("SSL") || code.includes("SIGNATURE")) {
    return {
      level: "error",
      title: "Security certificate problem",
      meaning: "The site's HTTPS certificate couldn't be verified.",
      checks: [
        "The certificate may be expired or self-signed.",
        "If this is your own server, check its HTTPS setup.",
      ],
    };
  }

  return {
    level: "error",
    title: "Request failed",
    meaning: "The request couldn't be completed and no response came back.",
    checks: [err.message || "Check the URL and your connection."],
  };
}