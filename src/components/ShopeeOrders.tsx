import {
  Button,
  Checkbox,
  Label,
  TextInput,
  Textarea,
} from "flowbite-react";
import { Copy, MagicStar } from "iconsax-react";
import * as JavaScriptObfuscator from "javascript-obfuscator";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";

type Props = {
  notionInput: {
    notionApiKey: string;
    notionPageUrl: string;
  };
};

export default function ShopeeOrders(props: Props) {
  const {
    notionInput: { notionApiKey, notionPageUrl },
  } = props;

  const [input, setInput] = useState({
    offsetRequests: 0,
    numberOfRequests: 1,
    numberPerRequests: 2,
  });
  const [result, setResult] = useState("");
  const [obfuscateCode, setObfuscateCode] = useState(true);
  const [maximumRecords, setMaximumRecords] = useState(0);

  useEffect(() => {
    setResult("");
    setMaximumRecords(input.numberOfRequests * input.numberPerRequests * 20);
  }, [input.numberOfRequests, input.numberPerRequests]);

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (maximumRecords >= 100) {
        return;
      }

      if (!notionApiKey || !notionPageUrl) {
        toast.error("Please input Notion.")
        return;
      }

      const host = window.location.href;
      const notionPageId = notionPageUrl.split("-").pop() || '';

      const offsetRequests = Math.floor(input.offsetRequests);
      const numberOfRequests = Math.floor(input.numberOfRequests);
      const numberPerRequests = Math.floor(input.numberPerRequests);

      const codeRequestJs = `
        console.clear();
        console.info("Get data...");

        const api =
          "https://shopee.vn/api/v4/order/get_all_order_and_checkout_list?limit=20&offset=";
        const urls = Array.from({ length: 1000 }, (_, i) => api + (i * 20 + ${offsetRequests}));

        const rawData = [];

        let index = 0;
        let isStop = false;
        let chunkData = [];
        const chunkSize = ${numberPerRequests};
        do {
          chunkData = await Promise.all(
            urls
              .slice(index, index + chunkSize)
              .map((url) => fetch(url).then((res) => res.json()))
          );

          if (index === ${
            numberOfRequests - 1
          } || chunkData.every((data) => data.data.next_offset === -1)) {
            isStop = true;
          }

          rawData.push(...chunkData);

          index += 1;
        } while (!isStop);

        const ordersRaw = rawData
          .map((data) => data.data.order_data.details_list)
          .filter((data) => data)
          .flat();

        console.info(ordersRaw);
        console.info("Add data...");

        await fetch("${host}api/shopee/orders", {
          method: "POST",
          body: JSON.stringify({
            ordersRaw,
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
    [
      input.numberOfRequests,
      input.numberPerRequests,
      input.offsetRequests,
      maximumRecords,
      notionApiKey,
      notionPageUrl,
      obfuscateCode,
    ]
  );

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  }, []);

  const onCopyToClipboard = useCallback((value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to Clipboard");
  }, []);

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit}>
      <div>
        <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This is tools for get your orders from Shopee.
          <a
            href="https://excited-shoe-10d.notion.site/-4cce7ba755f8477d9319f65a8d645fce"
            className="ml-1 font-medium text-cyan-600 hover:underline dark:text-cyan-500"
            target="_blank"
          >
            Learn more »
          </a>
          .
        </span>
      </div>
      <div>
        <div className="flex flex-row gap-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="offsetRequests" value="Offset" />
            </div>
            <TextInput
              id="offsetRequests"
              type="number"
              name="offsetRequests"
              value={input.offsetRequests}
              onChange={onChange}
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="numberOfRequests" value="Number of requests" />
            </div>
            <TextInput
              id="numberOfRequests"
              type="number"
              name="numberOfRequests"
              value={input.numberOfRequests}
              onChange={onChange}
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="numberPerRequests" value="Number per requests" />
            </div>
            <TextInput
              id="numberPerRequests"
              type="number"
              name="numberPerRequests"
              value={input.numberPerRequests}
              onChange={onChange}
            />
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Maximum orders: {maximumRecords} records.
        </div>
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
        <Button type="submit" disabled={maximumRecords >= 100}>
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
      <Textarea
        rows={10}
        value={result}
        placeholder="Your code here..."
        disabled={maximumRecords >= 100}
      />
    </form>
  );
}
