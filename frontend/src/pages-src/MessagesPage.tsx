"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import PublicLayout from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Send, Users } from "lucide-react";
import MessageTemplatesPicker from "@/components/messages/MessageTemplatesPicker";
import MessageBubble from "@/components/messages/MessageBubble";
import CalendlyWidget from "@/components/messages/CalendlyWidget";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  participant_id: string;
  subject: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

const MessagesPage = () => {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [researcherUserId, setResearcherUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [calendlyUrl, setCalendlyUrl] = useState("");

  // Researcher-specific state
  const [allParticipants, setAllParticipants] = useState<{ id: string; user_id: string; name: string }[]>([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (user) init();
  }, [user, loading]);

  const init = async () => {
    if (!user) return;

    // Load Calendly URL from study_settings
    try {
      const setting = await apiClient.get("/api/study-settings/calendly_url");
      if (setting && setting.setting_value) setCalendlyUrl(setting.setting_value);
    } catch {}

    if (userRole === "researcher") {
      const participants = await apiClient.get("/api/participants").catch(() => []);

      if (participants) {
        const userIds = participants.map((p) => p.user_id);
        const profiles = await apiClient.get("/api/users/profiles").catch(() => []);

        const nameMap: Record<string, string> = {};
        (profiles || []).forEach((p) => { nameMap[p.user_id] = p.full_name; });

        setAllParticipants(
          participants.map((p) => ({ id: p.id, user_id: p.user_id, name: nameMap[p.user_id] || "Unknown" }))
        );

        if (participants.length > 0) {
          setSelectedParticipantId(participants[0].id);
          await loadMessages(participants[0].id);
        }
      }
      setIsLoading(false);
      return;
    }

    // Participant flow
    const participant = await apiClient.get("/api/participants/me").catch(() => []);

    if (!participant || !participant.onboarding_completed) {
      toast({ title: "Please complete onboarding first. Go to your dashboard to begin.", variant: "destructive" });
      router.push("/onboarding");
      return;
    }

    setParticipantId(participant.id);
    const researcherId = await apiClient.get("/api/users/researcher-id").catch(() => null);
    if (researcherId) setResearcherUserId(researcherId as string);

    await loadMessages(participant.id);
    setIsLoading(false);
  };

  const loadMessages = async (pId: string) => {
    const data = await apiClient.get("/api/messages").catch(() => []);

    setMessages((data as Message[]) || []);

    if (data && user) {
      const unread = data.filter((m: any) => !m.is_read && m.recipient_id === user.id);
      for (const msg of unread) {
        await apiClient.put(`/api/messages/${(msg as any).id}`, { is_read: true });
      }
    }
  };

  const handleParticipantSwitch = async (pId: string) => {
    setSelectedParticipantId(pId);
    await loadMessages(pId);
  };

  // Realtime subscription
  useEffect(() => {
    const subId = userRole === "researcher" ? selectedParticipantId : participantId;
    if (!subId) return;

    

  }, [participantId, selectedParticipantId, user, userRole]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!body.trim()) {
      toast({ title: "Please enter a message", variant: "destructive" });
      return;
    }

    const pId = userRole === "researcher" ? selectedParticipantId : participantId;
    if (!pId || !user) return;

    const recipientId = userRole === "researcher"
      ? allParticipants.find((p) => p.id === pId)?.user_id
      : researcherUserId;
    if (!recipientId) return;

    setIsSending(true);
    try {
      const result = await apiClient.post("/api/messages", {
        sender_id: user.id,
        recipient_id: recipientId,
        participant_id: pId,
        subject: "",
        body: body.trim(),
      });
      setBody("");
      toast({ title: "Message sent!" });
    } catch (error: any) {
      toast({ title: "Error sending message", description: error.message, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastBody.trim() || !user) return;
    setIsBroadcasting(true);
    try {
      const inserts = allParticipants.map((p) => ({
        sender_id: user.id,
        recipient_id: p.user_id,
        participant_id: p.id,
        subject: broadcastSubject.trim() || "",
        body: broadcastBody.trim(),
      }));
      await apiClient.post("/api/messages", inserts);
      toast({ title: "Broadcast sent!", description: `Message sent to ${allParticipants.length} participants.` });
      setBroadcastBody("");
      setBroadcastSubject("");
    } catch (error: any) {
      toast({ title: "Broadcast failed", description: error.message, variant: "destructive" });
    } finally {
      setIsBroadcasting(false);
    }
  };

  if (loading || isLoading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading font-serif font-bold text-foreground mb-1">Messages</h1>
              <p className="text-muted-foreground">
                {userRole === "researcher" ? "Communicate with study participants" : "Communicate with your research team"}
              </p>
            </div>
            {userRole === "researcher" && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Broadcast to All
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Broadcast Message</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <MessageTemplatesPicker
                      label="Use a template…"
                      onSelect={(t) => {
                        setBroadcastSubject(t.subject);
                        setBroadcastBody(t.body);
                      }}
                    />
                    <Input
                      placeholder="Subject (optional)"
                      value={broadcastSubject}
                      onChange={(e) => setBroadcastSubject(e.target.value)}
                    />
                    <Textarea
                      placeholder="Write your message to all participants..."
                      value={broadcastBody}
                      onChange={(e) => setBroadcastBody(e.target.value)}
                      className="min-h-[120px]"
                    />
                    <Button onClick={handleBroadcast} disabled={isBroadcasting || !broadcastBody.trim()} className="w-full">
                      {isBroadcasting ? "Sending..." : `Send to ${allParticipants.length} Participants`}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Researcher: participant selector + template picker */}
          {userRole === "researcher" && allParticipants.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedParticipantId || ""} onValueChange={handleParticipantSwitch}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select participant..." />
                </SelectTrigger>
                <SelectContent>
                  {allParticipants.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <MessageTemplatesPicker
                label="Insert template…"
                onSelect={(t) => setBody(t.body)}
              />
            </div>
          )}

          {/* Chat card */}
          <Card className="shadow-card">
            <CardContent className="p-0">
              {messages.length === 0 ? (
                <div className="py-16 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-foreground mb-1">No Messages Yet</h3>
                  <p className="text-muted-foreground">
                    {userRole === "researcher"
                      ? "Start a conversation with this participant."
                      : "Messages from your research team will appear here."}
                  </p>
                </div>
              ) : (
                <>
                  <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isMine = msg.sender_id === user?.id;
                        return (
                          <MessageBubble
                            key={msg.id}
                            body={msg.body}
                            subject={msg.subject}
                            isMine={isMine}
                            createdAt={msg.created_at}
                            senderLabel={isMine ? "You" : userRole === "researcher" ? "Participant" : "Researcher"}
                          />
                        );
                      })}
                    </div>
                  </ScrollArea>

                  {((userRole === "participant" && researcherUserId && messages.length > 0) ||
                    userRole === "researcher") && (
                    <div className="p-3 border-t border-border flex gap-2">
                      <Textarea
                        placeholder={userRole === "researcher" ? "Send a message..." : "Reply to researcher..."}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        maxLength={5000}
                        className="min-h-[44px] max-h-[100px] resize-none"
                        rows={1}
                      />
                      <Button onClick={handleSend} disabled={isSending || !body.trim()} size="icon" className="flex-shrink-0 min-h-[44px] min-w-[44px]">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {userRole === "participant" && !researcherUserId && (
            <p className="text-sm text-muted-foreground text-center">
              No researcher is currently assigned. Messages will be delivered when one is available.
            </p>
          )}

          {userRole === "participant" && messages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              You'll be able to reply once the researcher sends you a message.
            </p>
          )}

          {/* Calendly widget — visible to participants, configurable by researcher */}
          <CalendlyWidget calendlyUrl={calendlyUrl} />
        </div>
      </div>
    </PublicLayout>
  );
};

export default MessagesPage;
