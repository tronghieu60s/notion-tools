import { Button, Label, TextInput, Textarea } from "flowbite-react";
import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import * as JavaScriptObfuscator from "javascript-obfuscator";

export default function ShopeeOrders() {
  const [input, setInput] = useState({
    offsetRequests: 0,
    numberOfRequests: 1,
    numberPerRequests: 2,
  });
  const [result, setResult] = useState("");
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

      const offsetRequests = Math.floor(input.offsetRequests);
      const numberOfRequests = Math.floor(input.numberOfRequests);
      const numberPerRequests = Math.floor(input.numberPerRequests);

      setResult(
        `${JavaScriptObfuscator.obfuscate(
          `
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

          console.log(
            rawData
              .map((data) => data.data.order_data.details_list)
              .filter((data) => data)
              .flat()
          );
          `,
          { compact: true }
        )}`
      );
    },
    [
      input.numberOfRequests,
      input.numberPerRequests,
      input.offsetRequests,
      maximumRecords,
    ]
  );

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  }, []);

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit}>
      <div>
        <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This is tools for get data orders from Shopee.
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
      <Button type="submit" disabled={maximumRecords >= 100}>
        Get Code
      </Button>
      <Textarea
        id="result"
        rows={10}
        value={result}
        onChange={(event) => setResult(event.target.value)}
        placeholder="Paste code here..."
        disabled={maximumRecords >= 100}
      />
    </form>
  );
}
