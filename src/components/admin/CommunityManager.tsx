import { useCallback, useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Users, CalendarDays, RefreshCw, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loadAdminCommunity, membershipError, shiftUniversityError, GROUP_ROLES, SERVICE_ROLES, localDateKey, type StudentGroup, type BookedShift } from "@/lib/communityManagement";

type CommunityData = Awaited<ReturnType<typeof loadAdminCommunity>>;
const emptyData: CommunityData = { students: [], groups: [], universities: [], members: [], volunteers: [], shifts: [] };
const emptyGroup = { name: "", university_id: "", gender: "male", academic_year: "", description: "", focus_tags: "", activities: "" };
const emptyShift = { khadim_id: "", university_id: "", assigned_date: "", assigned_role: "food_serving", meal_type: "iftar" };
const tags = (s: string) => s.split(",").map(t => t.trim()).filter(Boolean);

function Choice({ label, value, onChange, items, disabled }: { label: string; value: string; onChange: (value: string) => void; items: { value: string; label: string }[]; disabled?: boolean }) {
  return <div className="space-y-2"><Label>{label}</Label><Select value={value} onValueChange={onChange} disabled={disabled}><SelectTrigger aria-label={label}><SelectValue placeholder={`Select ${label.toLowerCase()}`} /></SelectTrigger><SelectContent>{items.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}</SelectContent></Select></div>;
}

export function CommunityManager() {
  const [data, setData] = useState<CommunityData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState("");
  const [saving, setSaving] = useState(false);
  const [university, setUniversity] = useState("all");
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<"group" | "member" | "volunteer" | "shift" | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [shiftId, setShiftId] = useState<string | null>(null);
  const [groupForm, setGroupForm] = useState(emptyGroup);
  const [memberForm, setMemberForm] = useState({ group_id: "", user_id: "", role: "Member" });
  const [volunteerForm, setVolunteerForm] = useState({ university_id: "", user_id: "", period: "regular" });
  const [shiftForm, setShiftForm] = useState(emptyShift);
  const [deletion, setDeletion] = useState<{ kind: "member" | "shift"; id: string } | null>(null);

  const load = useCallback(async () => {
    setFailure("");
    try { setData(await loadAdminCommunity()); }
    catch (e) { setFailure(e instanceof Error ? e.message : "Could not load university records. Admin access is required."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    void load();
    const channel = supabase.channel("admin-community");
    for (const table of ["student_groups", "group_members", "khadim_registrations", "khadim_schedule"]) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => void load());
    }
    channel.subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [load]);

  const uniItems = data.universities.map(u => ({ value: u.id, label: `${u.short_name} · ${u.city}` }));
  const defaultUniversity = university === "all" ? "" : university;
  const uniName = (id: string) => data.universities.find(u => u.id === id)?.short_name ?? "University unavailable";
  const studentName = (id: string) => data.students.find(p => p.id === id)?.full_name ?? "Student profile unavailable";
  const visibleGroups = data.groups.filter(g => (university === "all" || g.university_id === university) && g.name.toLowerCase().includes(query.toLowerCase()));
  const visibleShifts = data.shifts.filter(s => university === "all" || s.university_id === university);
  const visibleVolunteers = data.volunteers.filter(v => university === "all" || v.university_id === university);
  const selectedGroup = data.groups.find(g => g.id === memberForm.group_id);
  const availableStudents = selectedGroup ? data.students.filter(p => p.university_id === selectedGroup.university_id && p.gender.toLowerCase() === selectedGroup.gender.toLowerCase() && !data.members.some(m => m.group_id === selectedGroup.id && m.user_id === p.id)) : [];
  const eligibleVolunteers = data.volunteers.filter(v => v.university_id === shiftForm.university_id);
  const editGroup = (g?: StudentGroup) => {
    setGroupId(g?.id ?? null);
    setGroupForm(g ? { name: g.name, university_id: g.university_id, gender: g.gender, academic_year: g.academic_year ?? "", description: g.description ?? "", focus_tags: g.focus_tags.join(", "), activities: g.activities.join(", ") } : { ...emptyGroup, university_id: defaultUniversity });
    setDialog("group");
  };
  const editShift = (s?: BookedShift) => {
    setShiftId(s?.id ?? null);
    setShiftForm(s ? { khadim_id: s.khadim_id, university_id: s.university_id, assigned_date: s.assigned_date, assigned_role: s.assigned_role, meal_type: s.meal_type } : { ...emptyShift, university_id: defaultUniversity });
    setDialog("shift");
  };

  const save = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true);
    try {
      if (dialog === "group") {
        if (!groupForm.name.trim() || !groupForm.university_id) throw new Error("Choose a university and enter a group name.");
        const values = { ...groupForm, name: groupForm.name.trim(), focus_tags: tags(groupForm.focus_tags), activities: tags(groupForm.activities), description: groupForm.description.trim() || null, academic_year: groupForm.academic_year.trim() || null };
        const result = groupId ? await supabase.from("student_groups").update(values).eq("id", groupId).select("id").single() : await supabase.from("student_groups").insert(values).select("id").single();
        if (result.error) throw result.error;
      } else if (dialog === "member") {
        const student = data.students.find(p => p.id === memberForm.user_id);
        if (!selectedGroup || !student) throw new Error("Choose a group and student.");
        const issue = membershipError(selectedGroup, student, data.members.filter(m => m.group_id === selectedGroup.id).length);
        if (issue) throw new Error(issue);
        const { error } = await supabase.from("group_members").insert(memberForm);
        if (error) throw error;
      } else if (dialog === "volunteer") {
        const student = data.students.find(p => p.id === volunteerForm.user_id);
        if (!student || student.university_id !== volunteerForm.university_id) throw new Error("Choose a student in this university.");
        if (data.volunteers.some(v => v.user_id === student.id && v.period === volunteerForm.period)) throw new Error("Student is already registered for this period.");
        const { error } = await supabase.from("khadim_registrations").insert({ ...volunteerForm, preferred_roles: [], is_approved: true });
        if (error) throw error;
      } else if (dialog === "shift") {
        const volunteer = data.volunteers.find(v => v.id === shiftForm.khadim_id);
        const student = data.students.find(p => p.id === volunteer?.user_id);
        if (!volunteer || !student || !shiftForm.assigned_date) throw new Error("Choose a registered volunteer and a shift date.");
        const issue = shiftUniversityError(shiftForm.university_id, volunteer, student);
        if (issue) throw new Error(issue);
        const result = shiftId ? await supabase.from("khadim_schedule").update(shiftForm).eq("id", shiftId).select("id").single() : await supabase.from("khadim_schedule").insert(shiftForm).select("id").single();
        if (result.error) throw result.error;
      }
      toast.success("Saved to your university records"); setDialog(null); await load();
    } catch (e) { toast.error(e && typeof e === "object" && "message" in e ? String(e.message) : "Could not save changes"); }
    finally { setSaving(false); }
  };
  const deleteRecord = async () => {
    if (!deletion) return; setSaving(true);
    const { error } = await supabase.from(deletion.kind === "member" ? "group_members" : "khadim_schedule").delete().eq("id", deletion.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(deletion.kind === "member" ? "Member removed" : "Shift cancelled"); setDeletion(null); await load();
  };
  const updateRole = async (id: string, role: string) => {
    const { error } = await supabase.from("group_members").update({ role }).eq("id", id);
    if (error) return toast.error(error.message);
    await load();
  };

  return <div className="space-y-6">
    <div className="flex flex-wrap gap-3 items-end">
      <div className="w-full sm:w-64"><Choice label="University filter" value={university} onChange={setUniversity} items={[{ value: "all", label: "All universities" }, ...uniItems]} /></div>
      <Button variant="outline" size="icon" aria-label="Refresh group and shift records" onClick={() => void load()}><RefreshCw className="h-4 w-4" /></Button>
      <div className="flex flex-wrap gap-2 sm:ml-auto"><Button onClick={() => editGroup()}><Plus />Create group</Button><Button variant="outline" onClick={() => { setVolunteerForm({ university_id: defaultUniversity, user_id: "", period: "regular" }); setDialog("volunteer"); }}><UserPlus />Add volunteer</Button><Button onClick={() => editShift()}><CalendarDays />Book shift</Button></div>
    </div>
    {failure && <div role="alert" className="text-sm text-destructive border border-destructive/30 p-4 rounded-lg">{failure}<Button variant="link" onClick={() => void load()}>Retry</Button></div>}
    {loading ? <Skeleton className="h-48 w-full" /> : <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[
        ["Groups", data.groups.filter(g => university === "all" || g.university_id === university).length],
        ["Group members", data.members.filter(m => data.groups.some(g => g.id === m.group_id && (university === "all" || g.university_id === university))).length],
        ["Registered volunteers", visibleVolunteers.length], ["Booked shifts", visibleShifts.length],
      ].map(([label, count]) => <Card key={label}><CardContent className="p-4"><p className="text-2xl font-semibold text-primary">{count}</p><p className="text-xs text-muted-foreground mt-1">{label}</p></CardContent></Card>)}</div>
      <Tabs defaultValue="groups"><TabsList className="grid grid-cols-3 w-full"><TabsTrigger value="groups">Groups</TabsTrigger><TabsTrigger value="shifts">Booked shifts</TabsTrigger><TabsTrigger value="volunteers">Volunteers</TabsTrigger></TabsList>
        <TabsContent value="groups" className="space-y-4"><Input aria-label="Search groups" placeholder="Search groups" value={query} onChange={e => setQuery(e.target.value)} />
          {visibleGroups.length === 0 && <EmptyState icon={Users} title="No groups yet" description="No groups have been created for this selection." />}
          {visibleGroups.map(g => <Card key={g.id}><CardHeader className="pb-3"><div className="flex justify-between items-start gap-3"><div><CardTitle className="text-xl leading-snug">{g.name}</CardTitle><p className="text-xs text-muted-foreground mt-2">{uniName(g.university_id)} · {g.gender === "female" ? "Sisters" : "Brothers"} · {g.academic_year}</p></div><Button variant="ghost" size="icon" aria-label={`Edit ${g.name}`} onClick={() => editGroup(g)}><Pencil /></Button></div>{g.description && <p className="text-sm text-muted-foreground">{g.description}</p>}</CardHeader><CardContent className="space-y-3">
            <div className="flex justify-between items-center"><Badge variant="secondary">{data.members.filter(m => m.group_id === g.id).length}/14 members</Badge><Button variant="outline" size="sm" onClick={() => { setMemberForm({ group_id: g.id, user_id: "", role: "Member" }); setDialog("member"); }}><UserPlus />Add member</Button></div>
            {data.members.filter(m => m.group_id === g.id).map(m => <div key={m.id} className="flex flex-wrap items-center gap-3 border-t border-border pt-3"><div className="flex-1 min-w-32"><p className="text-sm font-medium break-words">{studentName(m.user_id)}</p><p className="text-xs text-muted-foreground">{data.students.find(p => p.id === m.user_id)?.batch_year}</p></div><div className="w-32"><Select value={m.role} onValueChange={role => void updateRole(m.id, role)}><SelectTrigger aria-label={`Role for ${studentName(m.user_id)}`}><SelectValue /></SelectTrigger><SelectContent>{GROUP_ROLES.map(r => <SelectItem value={r} key={r}>{r}</SelectItem>)}</SelectContent></Select></div><Button variant="ghost" size="icon" aria-label={`Remove ${studentName(m.user_id)} from ${g.name}`} onClick={() => setDeletion({ kind: "member", id: m.id })}><Trash2 className="text-destructive" /></Button></div>)}
          </CardContent></Card>)}
        </TabsContent>
        <TabsContent value="shifts" className="space-y-3">{visibleShifts.length === 0 && <EmptyState icon={CalendarDays} title="No booked shifts" description="No shifts have been booked for this selection." />}{visibleShifts.map(s => {
          const v = data.volunteers.find(v => v.id === s.khadim_id);
          return <Card key={s.id}><CardContent className="p-4 flex flex-wrap justify-between gap-4"><div className="min-w-0"><p className="font-semibold break-words">{v ? studentName(v.user_id) : "Volunteer unavailable"}</p><p className="text-sm text-muted-foreground mt-1">{s.assigned_date} · {uniName(s.university_id)} · {s.meal_type}</p><p className="text-sm text-primary mt-2">{SERVICE_ROLES.find(r => r.id === s.assigned_role)?.label ?? s.assigned_role}</p></div><div className="flex gap-1"><Button variant="ghost" size="icon" aria-label={`Edit shift on ${s.assigned_date}`} onClick={() => editShift(s)}><Pencil /></Button><Button variant="ghost" size="icon" aria-label={`Cancel shift on ${s.assigned_date}`} onClick={() => setDeletion({ kind: "shift", id: s.id })}><Trash2 className="text-destructive" /></Button></div></CardContent></Card>;
        })}</TabsContent>
        <TabsContent value="volunteers" className="space-y-3">{visibleVolunteers.length === 0 && <EmptyState icon={Users} title="No registered volunteers" description="Students can register from Khadims, or an Admin can add an existing student." />}{visibleVolunteers.map(v => <Card key={v.id}><CardContent className="p-4 flex flex-wrap justify-between gap-3"><div><p className="font-medium">{studentName(v.user_id)}</p><p className="text-xs text-muted-foreground mt-1">{uniName(v.university_id)} · {v.period}</p><p className="text-sm text-muted-foreground mt-2">{v.availability_notes}</p></div><Button variant={v.is_approved ? "secondary" : "outline"} onClick={async () => { const { error } = await supabase.from("khadim_registrations").update({ is_approved: !v.is_approved }).eq("id", v.id); if (error) toast.error(error.message); else await load(); }}>{v.is_approved ? "Approved" : "Approve"}</Button></CardContent></Card>)}</TabsContent>
      </Tabs>
    </>}
    <Dialog open={dialog !== null} onOpenChange={o => { if (!o && !saving) setDialog(null); }}><DialogContent className="max-w-lg max-h-[88dvh] overflow-y-auto"><DialogHeader><DialogTitle>{dialog === "group" ? groupId ? "Edit group" : "Create group" : dialog === "member" ? "Add group member" : dialog === "volunteer" ? "Register volunteer" : shiftId ? "Edit shift" : "Book Khadim shift"}</DialogTitle><DialogDescription>University records</DialogDescription></DialogHeader><form onSubmit={save} className="space-y-4">
      {dialog === "group" && <><Choice label="Group university" value={groupForm.university_id} onChange={v => setGroupForm(f => ({ ...f, university_id: v }))} items={uniItems} /><div className="space-y-2"><Label htmlFor="group-name">Group name</Label><Input id="group-name" value={groupForm.name} maxLength={120} required onChange={e => setGroupForm(f => ({ ...f, name: e.target.value }))} /></div><Choice label="Group gender" value={groupForm.gender} onChange={v => setGroupForm(f => ({ ...f, gender: v }))} items={[{ value: "male", label: "Brothers" }, { value: "female", label: "Sisters" }]} /><div className="space-y-2"><Label htmlFor="academic-year">Academic year</Label><Input id="academic-year" value={groupForm.academic_year} onChange={e => setGroupForm(f => ({ ...f, academic_year: e.target.value }))} /></div><div className="space-y-2"><Label htmlFor="group-description">Description</Label><Textarea id="group-description" value={groupForm.description} onChange={e => setGroupForm(f => ({ ...f, description: e.target.value }))} /></div>{([['focus_tags','Interests (comma-separated)'],['activities','Activities (comma-separated)']] as const).map(([key,label]) => <div key={key} className="space-y-2"><Label htmlFor={key}>{label}</Label><Input id={key} value={groupForm[key]} onChange={e => setGroupForm(f => ({ ...f, [key]: e.target.value }))} /></div>)}</>}
      {dialog === "member" && <><Choice label="Student" value={memberForm.user_id} onChange={v => setMemberForm(f => ({ ...f, user_id: v }))} items={availableStudents.map(p => ({ value: p.id, label: `${p.full_name} · ${p.batch_year ?? "Year not set"}` }))} /><Choice label="Member role" value={memberForm.role} onChange={v => setMemberForm(f => ({ ...f, role: v }))} items={GROUP_ROLES.map(r => ({ value: r, label: r }))} />{availableStudents.length === 0 && <p className="text-sm text-muted-foreground">No unassigned students of this university and gender.</p>}</>}
      {dialog === "volunteer" && <><Choice label="Volunteer university" value={volunteerForm.university_id} onChange={v => setVolunteerForm(f => ({ ...f, university_id: v, user_id: "" }))} items={uniItems} /><Choice label="Volunteer student" value={volunteerForm.user_id} onChange={v => setVolunteerForm(f => ({ ...f, user_id: v }))} items={data.students.filter(p => p.university_id === volunteerForm.university_id).map(p => ({ value: p.id, label: p.full_name }))} /><Choice label="Service period" value={volunteerForm.period} onChange={v => setVolunteerForm(f => ({ ...f, period: v }))} items={[{ value: "regular", label: "Regular" }, { value: "ramadan", label: "Ramadan" }]} /></>}
      {dialog === "shift" && <><Choice label="Shift university" value={shiftForm.university_id} onChange={v => setShiftForm(f => ({ ...f, university_id: v, khadim_id: "" }))} items={uniItems} /><Choice label="Registered volunteer" value={shiftForm.khadim_id} onChange={v => setShiftForm(f => ({ ...f, khadim_id: v }))} items={eligibleVolunteers.map(v => ({ value: v.id, label: `${studentName(v.user_id)} · ${v.period}` }))} /><div className="space-y-2"><Label htmlFor="shift-date">Shift date</Label><Input id="shift-date" type="date" value={shiftForm.assigned_date} required onChange={e => setShiftForm(f => ({ ...f, assigned_date: e.target.value }))} /></div><Choice label="Service role" value={shiftForm.assigned_role} onChange={v => setShiftForm(f => ({ ...f, assigned_role: v }))} items={SERVICE_ROLES.map(r => ({ value: r.id, label: r.label }))} /><Choice label="Meal" value={shiftForm.meal_type} onChange={v => setShiftForm(f => ({ ...f, meal_type: v }))} items={[{ value: "iftar", label: "Iftar" }, { value: "suhoor", label: "Suhoor" }, { value: "both", label: "Both" }]} />{eligibleVolunteers.length === 0 && <p className="text-sm text-muted-foreground">No registered volunteers for this university.</p>}</>}
      <Button type="submit" className="w-full" disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : null}Save {dialog === "shift" ? "shift" : dialog === "group" ? "group" : dialog === "member" ? "member" : "volunteer"}</Button>
    </form></DialogContent></Dialog>
    <Dialog open={deletion !== null} onOpenChange={o => { if (!o && !saving) setDeletion(null); }}><DialogContent><DialogHeader><DialogTitle>{deletion?.kind === "member" ? "Remove member?" : "Cancel booked shift?"}</DialogTitle><DialogDescription>{deletion?.kind === "member" ? "This removes the membership, not the student account." : "This removes the booking from the student's schedule."}</DialogDescription></DialogHeader><div className="flex gap-3 justify-end"><Button variant="outline" onClick={() => setDeletion(null)}>Keep</Button><Button variant="destructive" disabled={saving} onClick={() => void deleteRecord()}>Confirm</Button></div></DialogContent></Dialog>
  </div>;
}