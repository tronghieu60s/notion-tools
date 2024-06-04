import { Button, Checkbox, Label, TextInput, Textarea } from "flowbite-react";
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

export default function ShopeeFlashSale(props: Props) {
  const {
    notionInput: { notionApiKey, notionPageUrl },
  } = props;

  const [result, setResult] = useState("");
  const [obfuscateCode, setObfuscateCode] = useState(true);

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const host = window.location.href;
      const apiRequest = `${host}api/shopee/flash-sale`;

      const notionPageId = notionPageUrl.split("-").pop();

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

        console.log(endTime, sessions);
        console.info("Add data...");

        await fetch("${apiRequest}", {
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

  const onCopyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(result);
    toast.success("Copied to Clipboard");
  }, [result]);

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit}>
      <div>
        <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This is tools for get data flash sale from Shopee.
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
          <Button type="button" onClick={onCopyToClipboard}>
            <Copy size={18} className="mr-2" />
            Copy
          </Button>
        )}
      </div>
      <Textarea
        id="result"
        rows={10}
        value={result}
        onChange={(event) => setResult(event.target.value)}
        placeholder="Your code here..."
      />
    </form>
  );
}
