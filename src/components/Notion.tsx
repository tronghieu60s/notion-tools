import { Button, Label, TextInput, Textarea } from "flowbite-react";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Notion() {
  const [input, setInput] = useState({
    notionApiKey: "",
    notionPageId: "",
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
    const { notionApiKey, notionPageId } = input;

    await toast.promise(
      new Promise((resolve, reject) => {
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
          <Label htmlFor="notionPageId" value="Page Id *" />
        </div>
        <TextInput
          id="notionPageId"
          name="notionPageId"
          type="text"
          placeholder="Please enter your Notion Page Id..."
          value={input.notionPageId}
          onChange={onChange}
          helperText="Notion is only allowed to use data from an
      authorized page. Please enter Notion Page Id allowed."
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
                href="https://www.notion.so/my-integrations"
                className="ml-1 font-medium text-cyan-600 hover:underline dark:text-cyan-500"
              >
                Get here »
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
