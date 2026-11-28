"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import ChatbotForm, { type ChatbotFormValues } from "@/components/ChatbotForm";

export default function EditChatbotPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [initial, setInitial] = useState<Partial<ChatbotFormValues> | null>(
    null,
  );

  // Load current settings, then render the shared form in edit mode
  useEffect(() => {
    fetch(`/api/chatbots/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(({ chatbot }) =>
        setInitial({
          ...chatbot,
          description: chatbot.description || "",
          website_url: chatbot.website_url || "",
        }),
      )
      .catch(() => router.replace("/dashboard/chatbots"));
  }, [id, router]);

  if (!initial) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }
  return <ChatbotForm chatbotId={id} initial={initial} />;
}
