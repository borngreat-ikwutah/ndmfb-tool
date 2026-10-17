import { createFileRoute } from "@tanstack/react-router";
import { FileUp, Loader2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AudienceType, ContactImportReport, ContactList } from "@ndmfb/contract";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { getContactLists, importContacts } from "~/lib/audience-client";
import { createPageMeta } from "~/seo";

export const Route = createFileRoute("/_dashboard/recipients")({
  head: () => createPageMeta({ title: "Recipients", description: "Manage New Dawn staff and user audiences" }),
  component: RecipientsPage,
});

function RecipientsPage() {
  const [audienceType, setAudienceType] = useState<AudienceType>("user");
  const [listName, setListName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [lists, setLists] = useState<ContactList[]>([]);
  const [report, setReport] = useState<ContactImportReport | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const loadLists = () => getContactLists().then(setLists).catch(() => undefined);
  useEffect(() => {
    void loadLists();
  }, []);

  const handleImport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast.error("Choose a CSV file first");
      return;
    }
    setIsImporting(true);
    setReport(null);
    try {
      const result = await importContacts({ file, audienceType, listName: listName.trim() || undefined });
      setReport(result);
      setFile(null);
      setListName("");
      await loadLists();
      toast.success("Audience imported");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not import audience");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Audience workspace</p>
        <h1 className="text-2xl font-bold tracking-tight">Recipients</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">Keep one directory for New Dawn staff and users, then organize them into reusable notification lists.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><FileUp className="size-4" /> Import audience</CardTitle>
            <p className="text-sm text-muted-foreground">Upload a CSV with an <code>email</code> column. Optional columns include <code>name</code>, <code>first_name</code>, and <code>last_name</code>.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleImport} className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label>Audience type</Label>
                <Select value={audienceType} onValueChange={(value) => setAudienceType(value as AudienceType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">New Dawn users</SelectItem>
                    <SelectItem value="staff">New Dawn staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="list-name">Save to list <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="list-name" value={listName} onChange={(event) => setListName(event.target.value)} placeholder={audienceType === "staff" ? "All staff" : "Active users"} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="audience-file">CSV file</Label>
                <Input id="audience-file" type="file" accept=".csv,text/csv" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
              </div>
              <Button type="submit" disabled={isImporting}>{isImporting && <Loader2 className="animate-spin" />}{isImporting ? "Importing" : "Import audience"}</Button>
            </form>
            {report && (
              <div className="mt-6 rounded-lg border border-border/60 bg-muted/30 p-4 text-sm">
                <p className="font-medium">Import complete</p>
                <p className="mt-1 text-muted-foreground">{report.imported} new, {report.updated} updated, {report.duplicates} duplicates, {report.rejected} rejected.</p>
                {report.errors.length > 0 && <p className="mt-2 text-destructive">First issue: row {report.errors[0]?.row}, {report.errors[0]?.message}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Users className="size-4" /> Saved lists</CardTitle>
            <p className="text-sm text-muted-foreground">Lists are reusable targets for future notifications.</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {lists.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No lists yet. Import a CSV to create your first audience.</p>}
            {lists.map((list) => <div key={list.id} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-3"><div><p className="text-sm font-medium">{list.name}</p><p className="text-xs text-muted-foreground">{list.contactCount} contacts</p></div><Badge variant="outline">{list.audienceType === "staff" ? "Staff" : "Users"}</Badge></div>)}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
