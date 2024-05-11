import { Button, Label, TextInput, Textarea } from "flowbite-react";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Notion() {
  const [input, setInput] = useState({
    notionApiKey: "",
    notionPageUrl: "",
  });
  const [result, setResult] = useState("");
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

  const onSubmit = useCallback(async () => {
    const { notionApiKey, notionPageUrl } = input;

    await toast.promise(
      new Promise((resolve, reject) => {
        const notionPageId = notionPageUrl.split("-").pop();
        fetch("/api/notion/orders", {
          method: "POST",
          body: JSON.stringify({
            ordersRaw: result,
            notionApiKey,
            notionPageId,
          }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.message === "OK") {
              resolve("OK");
            }
            reject(res.message);
          })
          .catch((res) => reject(res));
      }),
      { loading: "Loading...", success: "Success", error: (error) => error }
    );
  }, [input, result]);

  return (
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
              The application requires permission to {`"read" and "write"`} to
              your account in Notion.
              <a
                href="https://excited-shoe-10d.notion.site/-d9fe212e5bb443469eb313bb7d3ae8655"
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
          <Label htmlFor="result" value="Notion Result" />
        </div>
        <Textarea
          id="result"
          rows={10}
          value={result}
          onChange={(event) => setResult(event.target.value)}
          placeholder="Paste result here..."
        />
      </div>
      <Button onClick={onSubmit}>Update Notion</Button>
    </div>
  );
}
