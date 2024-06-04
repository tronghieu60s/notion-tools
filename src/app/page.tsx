"use client";

import ShopeeOrders from "@/components/ShopeeOrders";
import { Accordion, Label, TextInput } from "flowbite-react";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function Home() {
  const [input, setInput] = useState({
    notionApiKey: "",
    notionPageUrl: "",
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const input = localStorage.getItem("_input.notion.cache") || "{}";
    const newInput = JSON.parse(input);
    setInput(newInput);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    localStorage.setItem("_input.notion.cache", JSON.stringify(input));
  }, [input, isLoaded]);

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  }, []);

  return (
    <div className="flex flex-row justify-between gap-10 p-5">
      <Toaster />
      <div className="w-4/12 flex flex-col gap-5">
        <div>
          <h3 className="text-2xl font-medium text-gray-900 dark:text-white">
            Notion
          </h3>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="notionPageUrl" value="Page Url *" />
            </div>
            <TextInput
              id="notionPageUrl"
              name="notionPageUrl"
              type="text"
              placeholder="Please enter your Notion Page Url..."
              value={input.notionPageUrl}
              onChange={onChange}
              helperText={
                <span>
                  Notion is only allowed to use data from an authorized page.
                  <a
                    href="https://excited-shoe-10d.notion.site/-070be3aafa724122bfb8c395942d36e2"
                    className="ml-1 font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                    target="_blank"
                  >
                    Learn more »
                  </a>
                  .
                </span>
              }
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="notionApiKey" value="API Key *" />
            </div>
            <TextInput
              id="notionApiKey"
              name="notionApiKey"
              type="text"
              placeholder="Please enter your Notion API Key..."
              value={input.notionApiKey}
              onChange={onChange}
              helperText={
                <span>
                  The application requires permission to {`"read" and "write"`}{" "}
                  to your account in Notion.
                  <a
                    href="https://excited-shoe-10d.notion.site/-d9fe212e5bb443469eb313bb7d3ae865"
                    className="ml-1 font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                    target="_blank"
                  >
                    Learn more »
                  </a>
                  .
                </span>
              }
            />
          </div>
        </div>
      </div>
      <div className="w-8/12 flex flex-col gap-5">
        <div>
          <h3 className="text-2xl font-medium text-gray-900 dark:text-white">
            Shopee
          </h3>
        </div>
        <div>
          <Accordion>
            <Accordion.Panel>
              <Accordion.Title className="text-sm p-4">
                📄 Shopee Orders
              </Accordion.Title>
              <Accordion.Content>
                <ShopeeOrders notionInput={input} />
              </Accordion.Content>
            </Accordion.Panel>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
