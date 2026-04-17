import { useChat } from "@ai-sdk/react";
declare const useC: ReturnType<typeof useChat>;
useC.sendMessage({ text: "hello" });
