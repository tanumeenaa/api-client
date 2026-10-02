import { Router } from "express";
import axios from "axios";
import { checkUrl } from "./urlGuard.js";
import { explainStatus, explainNetworkError } from "./explain.js";

const router = Router();
const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

router.post("/api/send", async (req, res) => {
  const { method = "GET", url, headers = {}, params = {}, body } = req.body;

  const upperMethod = String(method).toUpperCase();
  if (!ALLOWED_METHODS.includes(upperMethod)) {
    return res.status(400).json({ error: `Method ${method} is not supported.` });
  }

  const check = await checkUrl(url);
  if (!check.ok) {
    return res.status(400).json({ error: check.error });
  }

  const startedAt = Date.now();

  try {
    const response = await axios({
      method: upperMethod,
      url: check.url.toString(),
      headers,
      params,
      data: body,
      timeout: 15000,
      maxRedirects: 0,
      validateStatus: () => true,
      responseType: "text",
      transformResponse: [(data) => data],
      maxContentLength: 5 * 1024 * 1024,
    });

    const text = typeof response.data === "string" ? response.data : "";
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }

    res.json({
      status: response.status,
      statusText: response.statusText,
      timeMs: Date.now() - startedAt,
      size: Buffer.byteLength(text),
      headers: response.headers.toJSON(),
      body: text,
      json,
      explanation: explainStatus(response.status, {
        method: upperMethod,
        url: check.url.toString(),
      }),
    });
  } catch (err) {
    res.status(502).json({
      networkError: true,
      code: err.code || "UNKNOWN",
      message: err.message,
      timeMs: Date.now() - startedAt,
      explanation: explainNetworkError(err),
    });
  }
});

export default router;