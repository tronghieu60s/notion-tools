import { Client } from "@notionhq/client";
import moment from "moment";
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

  try {
    if (req.method === "GET") {
      const { notionApiKey = "", notionPageId = "" } = req.query;
      const notion = new Client({ auth: `${notionApiKey}` });
      const pageBlocks = await notion.blocks.children.list({
        block_id: `${notionPageId}`,
      });

      const pages = pageBlocks.results.filter(
        (object: any) =>
          object.type === "child_database" &&
          (object.child_database.title.includes(moment().format("DD.MM")) ||
            object.child_database.title.includes(
              moment().add(1, "days").format("DD.MM")
            ))
      );

      const sessions = pages.map((page: any) => page.child_database.title).slice(-5);

      res.status(200).json({ data: sessions, message: "OK" });
    }

    if (req.method === "POST") {
      const { sessionsRaw, notionApiKey, notionPageId } = JSON.parse(req.body);

      for (let index = 0; index < sessionsRaw.length; index += 1) {
        const session = sessionsRaw[index];

        const endTime = moment(session.endTime * 1000 + 1000).format("HH[H]mm");
        const startTime = moment(session.startTime * 1000).format("HH[H]mm");
        const dateTime = moment(session.startTime * 1000).format("DD.MM");
        const sessionName = `Flash Sale (${dateTime} ${startTime} - ${endTime})`;

        const notion = new Client({ auth: notionApiKey });
        const pageBlocks = await notion.blocks.children.list({
          block_id: notionPageId,
        });

        const pageSession = pageBlocks.results.find(
          (object: any) =>
            object.type === "child_database" &&
            object.child_database.title === sessionName
        );

        if (!pageSession) {
          await notion.databases.create({
            icon: { type: "emoji", emoji: "⚡" },
            parent: { type: "page_id", page_id: notionPageId },
            title: [{ type: "text", text: { content: sessionName } }],
            properties: {
              "Mã DH": { rich_text: {} },
              "Đơn hàng": { title: {} },
              "Tên Shop": { rich_text: {} },
              "Sản phẩm": { rich_text: {} },
              "Trạng thái": { rich_text: {} },
              "Vận chuyển": { rich_text: {} },
              "Thanh toán": { number: { format: "number_with_commas" } },
            },
          });
        }
      }

      res.status(200).json({ message: "OK" });
    }
  } catch (error) {
    res.status(400).json({ message: `${error}` });
  }
}
