import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AudienceType, ContactList } from "@ndmfb/contract";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { API_UNREACHABLE_MESSAGE } from "~/lib/api-client";
import {
  createNotificationDraft,
  getContactLists,
} from "~/lib/audience-client";
import { createPageMeta } from "~/seo";

export const Route = createFileRoute("/_dashboard/compose")({
  head: () =>
    createPageMeta({
      title: "Compose",
      description: "Draft a notification for New Dawn staff or users",
    }),
  component: ComposePage,
});

function ComposePage() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audienceType, setAudienceType] = useState<AudienceType>("user");
  const [listId, setListId] = useState("none");
  const [lists, setLists] = useState<ContactList[]>([]);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    void getContactLists()
      .then((contactLists) => {
        setLists(contactLists);
        setApiError(null);
      })
      .catch(() => setApiError(API_UNREACHABLE_MESSAGE));
  }, []);

  const saveDraft = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await createNotificationDraft({
        title,
        subject,
        body,
        audienceType,
        listId: listId === "none" ? undefined : listId,
      });
      toast.success("Draft saved");
      setTitle("");
      setSubject("");
      setBody("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save draft",
      );
    } finally {
      setSaving(false);
    }
  };

  const matchingLists = lists.filter(
    (list) => list.audienceType === audienceType,
  );

  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Notification workspace
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Compose</h1>
        <p className="text-sm text-muted-foreground">
          Draft a message for New Dawn staff or users. Sending will be added
          after the draft workflow is in place.
        </p>
      </div>
      {apiError ? (
        <div
          role="alert"
          className="max-w-4xl rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-500"
        >
          {apiError}
        </div>
      ) : null}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="text-base">New notification draft</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveDraft} className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="draft-title">Internal title</Label>
              <Input
                id="draft-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Monthly service update"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="draft-subject">Email subject</Label>
              <Input
                id="draft-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Important update from New Dawn"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Audience</Label>
              <Select
                value={audienceType}
                onValueChange={(value) => {
                  setAudienceType(value as AudienceType);
                  setListId("none");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">New Dawn users</SelectItem>
                  <SelectItem value="staff">New Dawn staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>
                Saved list{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Select value={listId} onValueChange={setListId}>
                <SelectTrigger>
                  <SelectValue placeholder="All contacts in this audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    All contacts in this audience
                  </SelectItem>
                  {matchingLists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.name} ({list.contactCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="draft-body">Message</Label>
              <Textarea
                id="draft-body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Write your notification here..."
                className="min-h-64"
                required
              />
            </div>
            <Button type="submit" disabled={saving} className="w-fit">
              {saving ? <Loader2 className="animate-spin" /> : <Save />}
              {saving ? "Saving" : "Save draft"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
