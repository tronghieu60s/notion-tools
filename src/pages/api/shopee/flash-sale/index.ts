import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await NextCors(req, res, {
    methods: ["POST"],
    origin: ["http://shopee.vn", "https://shopee.vn"],
  });

  if (req.method === "POST") {
    try {
      const { sessionsRaw, notionApiKey, notionPageId } = JSON.parse(req.body);
      console.log(sessionsRaw);

      res.status(200).json({ message: "OK" });
    } catch (error) {
      res.status(400).json({ message: `${error}` });
    }
  }
}
