import { useCallback, useEffect, useState } from "react";
import { readThreads, subscribeThreads, type ChatThread } from "./chat";

export function useChatThreads(): ChatThread[] {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const sync = useCallback(() => setThreads(readThreads()), []);

  useEffect(() => {
    sync();
    return subscribeThreads(sync);
  }, [sync]);

  return threads;
}

export function useChatThreadByCandidate(candidateId: string): ChatThread | null {
  const threads = useChatThreads();
  return threads.find((t) => t.candidateId === candidateId) ?? null;
}
