"use client";

import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageBubbleProps {
  body: string;
  subject?: string;
  isMine: boolean;
  createdAt: string;
  senderLabel: string;
}

const ZOOM_REGEX = /https?:\/\/(?:[\w-]+\.)?zoom\.us\/[^\s]+/gi;

const renderBodyWithLinks = (body: string, isMine: boolean) => {
  const zoomMatches = body.match(ZOOM_REGEX);
  if (!zoomMatches) {
    return <p className="text-sm whitespace-pre-wrap">{body}</p>;
  }

  const parts = body.split(ZOOM_REGEX);
  const elements: React.ReactNode[] = [];

  parts.forEach((part, i) => {
    if (part) elements.push(<span key={`t-${i}`}>{part}</span>);
    if (zoomMatches[i]) {
      elements.push(
        <a
          key={`z-${i}`}
          href={zoomMatches[i]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-1 mb-1"
        >
          <Button
            variant={isMine ? "secondary" : "default"}
            size="sm"
            className="gap-1.5"
            type="button"
            onClick={(e) => e.stopPropagation()}
          >
            <Video className="w-4 h-4" />
            Join Zoom Meeting
          </Button>
        </a>
      );
    }
  });

  return <div className="text-sm whitespace-pre-wrap">{elements}</div>;
};

const MessageBubble = ({ body, subject, isMine, createdAt, senderLabel }: MessageBubbleProps) => {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-xl px-4 py-3 ${
          isMine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        }`}
      >
        {subject && subject !== "No subject" && subject !== "" && (
          <p
            className={`text-xs font-semibold mb-1 ${
              isMine ? "text-primary-foreground/80" : "text-muted-foreground"
            }`}
          >
            {subject}
          </p>
        )}
        {renderBodyWithLinks(body, isMine)}
        <p
          className={`text-xs mt-1 ${
            isMine ? "text-primary-foreground/60" : "text-muted-foreground"
          }`}
        >
          {new Date(createdAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
          {" • "}
          {senderLabel}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
