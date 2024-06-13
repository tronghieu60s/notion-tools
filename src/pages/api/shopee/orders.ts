import { Client } from "@notionhq/client";
import moment from "moment";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      const { ordersRaw, notionApiKey, notionPageId } = JSON.parse(req.body);

      const orderItems = ordersRaw.map((order: any) => ({
        ctime: order.shipping?.tracking_info.ctime,
        order_id: order.info_card.order_id,
        final_total: order.info_card.final_total,
        status: order.status.status_label.text,
        delivery: order.shipping?.tracking_info.description,
        shop_name: order.info_card.order_list_cards[0].shop_info.shop_name,
        products: order.info_card.order_list_cards[0].product_info.item_groups
          .map((group: any) => group.items.map((product: any) => product.name))
          .flat(),
      }));

      if (orderItems.length >= 100) {
        throw new Error("Max 100 records.");
      }

      const notion = new Client({ auth: notionApiKey });
      const pageBlocks = await notion.blocks.children.list({
        block_id: notionPageId,
      });

      const pageOrder = pageBlocks.results.find(
        (object: any) =>
          object.type === "child_database" &&
          object.child_database.title === "Đơn hàng Shopee"
      );

      let pageOrderId = "";
      if (pageOrder) {
        pageOrderId = pageOrder.id;
      } else {
        const newDatabase = await notion.databases.create({
          icon: { type: "emoji", emoji: "📑" },
          parent: { type: "page_id", page_id: notionPageId },
          title: [{ type: "text", text: { content: "Đơn hàng Shopee" } }],
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
        pageOrderId = newDatabase.id;
      }

      const database = await notion.databases.query({
        database_id: pageOrderId,
      });
      const pages = database.results.filter((item) => item.object === "page");

      await Promise.all(
        orderItems.map((orderItem: any) => {
          const findPage = pages.find((page: any) =>
            page.properties["Mã DH"].rich_text[0].plain_text.includes(
              `${orderItem.order_id}`
            )
          );

          const orderTime = orderItem.ctime
            ? moment(orderItem.ctime * 1000).format("MM.YYYY")
            : "#";
          const orderName = `${orderTime}-${orderItem.products.join("-")}`;

          let statusName = orderItem.status;
          switch (orderItem.status) {
            case "label_on_the_way":
              statusName = "Đơn hàng đang giao";
              break;
            case "label_order_completed":
              statusName = "Đơn hàng đã giao";
              break;
            case "label_order_cancelled":
              statusName = "Đơn hàng đã hủy";
              break;
            case "label_waiting_pickup":
              statusName = "Đơn hàng đang chờ lấy";
              break;
            case "label_preparing_order":
              statusName = "Đơn hàng đang chuẩn bị";
              break;
            default:
              break;
          }

          if (findPage) {
            return notion.pages.update({
              page_id: findPage.id,
              properties: {
                "Mã DH": {
                  rich_text: [{ text: { content: `${orderItem.order_id}` } }],
                },
                "Đơn hàng": {
                  title: [{ text: { content: orderName } }],
                },
                "Tên Shop": {
                  rich_text: [{ text: { content: orderItem.shop_name } }],
                },
                "Sản phẩm": {
                  rich_text: [
                    { text: { content: orderItem.products.join(", ") } },
                  ],
                },
                "Trạng thái": {
                  rich_text: [{ text: { content: statusName } }],
                },
                "Vận chuyển": {
                  rich_text: [{ text: { content: orderItem.delivery || "" } }],
                },
                "Thanh toán": { number: orderItem.final_total / 100000 },
              },
            });
          }

          return notion.pages.create({
            parent: { database_id: pageOrderId },
            properties: {
              "Mã DH": {
                rich_text: [{ text: { content: `${orderItem.order_id}` } }],
              },
              "Đơn hàng": {
                title: [{ text: { content: orderName } }],
              },
              "Tên Shop": {
                rich_text: [{ text: { content: orderItem.shop_name } }],
              },
              "Sản phẩm": {
                rich_text: [
                  { text: { content: orderItem.products.join(", ") } },
                ],
              },
              "Trạng thái": {
                rich_text: [{ text: { content: statusName } }],
              },
              "Vận chuyển": {
                rich_text: [{ text: { content: orderItem.delivery || "" } }],
              },
              "Thanh toán": { number: orderItem.final_total / 100000 },
            },
          });
        })
      );

      res.status(200).json({ message: "OK" });
    }
  } catch (error) {
    res.status(400).json({ message: `${error}` });
  }
}
