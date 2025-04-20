import { NextApiRequest, NextApiResponse } from "next";
import { getLinkPreview } from "link-preview-js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res
      .status(405)
      .json({ message: `Method ${req.method} not allowed` });
  }

  try {
    const url = req.method === "GET" ? (req.query.url as string) : req.body.url;

    if (!url) {
      return res.status(400).json({ message: "URL parameter is required" });
    }

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ message: "Invalid URL format" });
    }

    const previewData = await getLinkPreview(url, {
      timeout: 3000,
      followRedirects: "follow",
      headers: {
        "Accept-Language": "en-US",
      },
    });

    return res.status(200).json(previewData);
  } catch (error) {
    console.error("Error fetching link preview:", error);
    return res.status(500).json({
      message: "Failed to fetch link preview",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
