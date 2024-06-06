import { Button, Checkbox, Label, ListGroup, Textarea } from "flowbite-react";
import { Copy, MagicStar } from "iconsax-react";
import * as JavaScriptObfuscator from "javascript-obfuscator";
import { FormEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

type Props = {
  notionInput: {
    notionApiKey: string;
    notionPageUrl: string;
  };
};

type FlashSale = {
  id: string;
  name: string;
};

export default function ShopeeFlashSale(props: Props) {
  const {
    notionInput: { notionApiKey, notionPageUrl },
  } = props;

  const [result, setResult] = useState("");
  const [obfuscateCode, setObfuscateCode] = useState(true);

  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [flashSalesResult, setFlashSalesResult] = useState("");
  const [flashSalesSelected, setFlashSalesSelected] = useState("");

  const getData = useCallback(async () => {
    if (!notionApiKey || !notionPageUrl) {
      return;
    }

    const apiSession = "/api/shopee/flash-sale/sessions";
    const notionPageId = notionPageUrl.split("-").pop() || "";

    const queryParams = new URLSearchParams();
    queryParams.append("notionApiKey", notionApiKey);
    queryParams.append("notionPageId", notionPageId);

    const queryString = queryParams.toString();

    const sessions = await fetch(`${apiSession}?${queryString}`).then((res) =>
      res.json()
    );
    setFlashSales(sessions.data);
  }, [notionApiKey, notionPageUrl]);

  useEffect(() => {
    getData();
  }, [getData]);

  useEffect(() => {
    if (flashSalesSelected) {
      const host = window.location.href;
      const notionPageId = notionPageUrl.split("-").pop() || "";

      const codeRequestJs = `
        console.clear();
        console.info("Get data...");
        
        const apiPromotion =
          "https://shopee.vn/api/v4/flash_sale/get_all_itemids?promotionid=${flashSalesSelected}";
        const responsePromotions = await fetch(apiPromotion).then((res) => res.json());
        
        if (!responsePromotions.data) {
          console.error("Cannot get data.");
        }
        
        const chunk = (arr, size) => {
          const chunked = [];
          for (let i = 0; i < arr.length; i += size) {
            const chunk = arr.slice(i, i + size);
            chunked.push(chunk);
          }
          return chunked;
        };
        
        const productIds = responsePromotions.data.item_brief_list.map(
          (item) => item.itemid
        );
        const productIdsChunks = chunk(productIds, 50).slice(0, 3);
        
        const products = await Promise.all(
          productIdsChunks.map(async (productIdsChunk) =>
            fetch("https://shopee.vn/api/v4/flash_sale/flash_sale_batch_get_items", {
              method: "POST",
              body: JSON.stringify({
                limit: 50,
                itemids: productIdsChunk,
                categoryid: 0,
                promotionid: ${flashSalesSelected},
                with_dp_items: true,
              }),
              headers: { "Content-Type": "application/json" },
            })
              .then((res) => res.json())
              .then((res) => res.data.items)
          )
        );

        const productsRaw = products.flat().map((product) => ({
          id: product.itemid,
          image: "https://down-vn.img.susercontent.com/file/" + product?.image,
          price: product.price / 100000,
          priceHidden: product?.hidden_price_display || '',
          ratingStars: Number(product.item_rating?.rating_star?.toFixed(2) || 0)
        }));

        console.log(productsRaw);
        console.info("Add data...");
      `;

      setFlashSalesResult(
        obfuscateCode
          ? `${JavaScriptObfuscator.obfuscate(codeRequestJs, {
              compact: true,
            })}`
          : codeRequestJs
      );
    }
  }, [flashSalesSelected, notionApiKey, notionPageUrl, obfuscateCode]);

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!notionApiKey || !notionPageUrl) {
        toast.error("Please input Notion.");
        return;
      }

      const host = window.location.href;
      const notionPageId = notionPageUrl.split("-").pop() || "";

      const codeRequestJs = `
        console.clear();
        console.info("Get data...");
        
        const apiSession = "https://shopee.vn/api/v4/flash_sale/get_all_sessions";
        const responseSessions = await fetch(apiSession).then((res) => res.json());
        
        if (!responseSessions.data) {
          console.error("Cannot get data.");
        }
        
        const endTime = responseSessions.data.current_session_end_time;
        const sessionsRaw = responseSessions.data.sessions.map((session) => ({
          id: session.promotionid,
          name: session.name,
          endTime: session.end_time,
          startTime: session.start_time,
        }));
        
        console.log(sessionsRaw);
        console.info("Add data...");
        
        await fetch("${host}api/shopee/flash-sale/sessions", {
          method: "POST",
          body: JSON.stringify({
            sessionsRaw,
            notionApiKey: "${notionApiKey}",
            notionPageId: "${notionPageId}",
          }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.message === "OK") {
              console.info("Success!");
              return;
            }
            console.error(res.message);
          })
          .catch((res) => console.error(res));
      `;

      setResult(
        obfuscateCode
          ? `${JavaScriptObfuscator.obfuscate(codeRequestJs, {
              compact: true,
            })}`
          : codeRequestJs
      );
    },
    [notionApiKey, notionPageUrl, obfuscateCode]
  );

  const onCopyToClipboard = useCallback((value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to Clipboard");
  }, []);

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit}>
      <div>
        <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This is tools for get data Flash Sale from Shopee.
          <a
            href="#"
            className="ml-1 font-medium text-cyan-600 hover:underline dark:text-cyan-500"
            target="_blank"
          >
            Learn more »
          </a>
          .
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="obfuscateCode"
          checked={obfuscateCode}
          onChange={(event) => setObfuscateCode(event.target.checked)}
        />
        <Label htmlFor="obfuscateCode" className="flex">
          Obfuscate Code
        </Label>
      </div>
      <div className="flex justify-between">
        <Button type="submit">
          <MagicStar size={18} className="mr-2" />
          Get Code
        </Button>
        {result && (
          <Button type="button" onClick={() => onCopyToClipboard(result)}>
            <Copy size={18} className="mr-2" />
            Copy
          </Button>
        )}
      </div>
      <Textarea rows={10} value={result} placeholder="Your code here..." />
      {flashSales.length > 0 && (
        <div className="flex gap-5">
          <ListGroup className="w-60">
            {flashSales.map((flashSale) => (
              <ListGroup.Item
                key={flashSale.id}
                active={flashSale.id === flashSalesSelected}
                onClick={() => setFlashSalesSelected(flashSale.id)}
              >
                <div>
                  Flash Sale
                  <div>{flashSale.name.replace("Flash Sale", "")}</div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
          <div className="w-full flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Using this code for get list of products Flash Sale in Shopee.
              </span>
              <Button type="button" onClick={() => onCopyToClipboard(flashSalesResult)}>
                <Copy size={18} className="mr-2" />
                Copy
              </Button>
            </div>
            <Textarea
              rows={10}
              value={flashSalesResult}
              placeholder="Your code here..."
            />
          </div>
        </div>
      )}
    </form>
  );
}
