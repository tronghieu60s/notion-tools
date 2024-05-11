"use client";

import Notion from "@/components/Notion";
import ShopeeOrders from "@/components/ShopeeOrders";
import { Accordion, Label, TextInput } from "flowbite-react";
import { headers } from "next/headers";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function Home() {
  return (
    <div className="flex flex-row justify-between gap-10 p-5">
      <Toaster />
      <div className="w-1/2 flex flex-col gap-5">
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
                <ShopeeOrders />
              </Accordion.Content>
            </Accordion.Panel>
          </Accordion>
        </div>
      </div>
      <div className="w-1/2 flex flex-col gap-5">
        <div>
          <h3 className="text-2xl font-medium text-gray-900 dark:text-white">
            Notion
          </h3>
        </div>
        <Notion />
      </div>
    </div>
  );
}
