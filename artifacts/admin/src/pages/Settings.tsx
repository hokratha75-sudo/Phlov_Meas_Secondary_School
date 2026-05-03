import { useState, useEffect } from "react";
import { useGetSiteSettings, useUpdateSiteSetting } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Save, ChevronDown, ChevronUp, Plus, Trash2, Check } from "lucide-react";

type LeadershipEntry = { nameEn: string; nameKh: string; titleEn: string; titleKh: string; descEn: string; descKh: string; photoUrl: string };
type ClubEntry = { titleEn: string; titleKh: string; descEn: string; descKh: string; color: string };
type ProgramEntry = { titleEn: string; titleKh: string; descEn: string; descKh: string };

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden mb-4">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left">
        <h3 className="font-bold text-gray-800">{title}</h3>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {open && <div className="px-6 py-4 border-t space-y-4">{children}</div>}
    </div>
  );
}

function Field({ label, value, onChange, multiline = false, placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      {multiline
        ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />}
    </div>
  );
}

function SaveButton({ onSave, saving, saved }: { onSave: () => void; saving: boolean; saved: boolean }) {
  return (
    <button onClick={onSave} disabled={saving}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${saved ? "bg-green-600 text-white" : "bg-[#1e3a6e] text-white hover:bg-[#2d5a8e]"} disabled:opacity-50`}>
      {saved ? <><Check size={14} /> Saved!</> : saving ? "Saving..." : <><Save size={14} /> Save</>}
    </button>
  );
}

function useSaveSetting(key: string, token: string | null) {
  const { mutate } = useUpdateSiteSetting({ request: { headers: { Authorization: `Bearer ${token}` } } });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = (value: string) => {
    setSaving(true);
    mutate({ data: { key, value } }, {
      onSuccess: () => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); },
      onError: () => setSaving(false),
    });
  };

  return { save, saving, saved };
}

function imageFileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function parseJson<T>(str: string | undefined, fallback: T): T {
  if (!str) return fallback;
  try { return JSON.parse(str) as T; } catch { return fallback; }
}

export default function SettingsPage() {
  const { token } = useAuth();
  const { data: settings, isLoading } = useGetSiteSettings({ request: { headers: { Authorization: `Bearer ${token}` } } });

  const heroSave = useSaveSetting("hero", token);
  const statsSave = useSaveSetting("stats", token);
  const missionSave = useSaveSetting("mission", token);
  const visionSave = useSaveSetting("vision", token);
  const historySave = useSaveSetting("about_history", token);
  const leadershipSave = useSaveSetting("leadership", token);
  const clubsSave = useSaveSetting("clubs", token);
  const programsSave = useSaveSetting("academic_programs", token);
  const contactSave = useSaveSetting("contact_info", token);
  const heroImageSave = useSaveSetting("hero_image", token);

  const [hero, setHero] = useState({ enrollmentBannerEn: "", enrollmentBannerKh: "", subtitleEn: "", subtitleKh: "" });
  const [stats, setStats] = useState({ studentsCount: "", teachersCount: "", programsCount: "", yearsExcellence: "", graduationRate: "", commitmentLabel: "" });
  const [mission, setMission] = useState({ textEn: "", textKh: "" });
  const [vision, setVision] = useState({ textEn: "", textKh: "" });
  const [history, setHistory] = useState({ paragraph1En: "", paragraph1Kh: "", paragraph2En: "", paragraph2Kh: "" });
  const [leadership, setLeadership] = useState<LeadershipEntry[]>([]);
  const [clubs, setClubs] = useState<ClubEntry[]>([]);
  const [programs, setPrograms] = useState<ProgramEntry[]>([]);
  const [contact, setContact] = useState({ phone: "", email: "", addressEn: "", addressKh: "", facebookUrl: "" });
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!settings) return;
    if (settings["hero"]) setHero(parseJson(settings["hero"], hero));
    if (settings["stats"]) setStats(parseJson(settings["stats"], stats));
    if (settings["mission"]) setMission(parseJson(settings["mission"], mission));
    if (settings["vision"]) setVision(parseJson(settings["vision"], vision));
    if (settings["about_history"]) setHistory(parseJson(settings["about_history"], history));
    if (settings["leadership"]) setLeadership(parseJson(settings["leadership"], []));
    if (settings["clubs"]) setClubs(parseJson(settings["clubs"], []));
    if (settings["academic_programs"]) setPrograms(parseJson(settings["academic_programs"], []));
    if (settings["contact_info"]) setContact(parseJson(settings["contact_info"], contact));
  }, [settings]);

  if (isLoading) return <div className="text-center text-gray-400 py-12">Loading settings...</div>;

  const CLUB_COLORS = ["bg-blue-50 text-blue-700", "bg-pink-50 text-pink-700", "bg-amber-50 text-amber-700", "bg-purple-50 text-purple-700", "bg-green-50 text-green-700", "bg-teal-50 text-teal-700", "bg-red-50 text-red-700", "bg-orange-50 text-orange-700"];
  const handleImageUpload = async (key: string, file?: File | null) => {
    if (!file) return;
    setUploadingKey(key);
    try {
      const value = await imageFileToDataUrl(file);
      if (key === "hero_image") {
        heroImageSave.save(value);
      }
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Site Settings</h2>
        <p className="text-gray-500 text-sm">Edit all public website content from here</p>
      </div>

      {/* Hero Section */}
      <Section title="Hero Section" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Enrollment Banner (English)" value={hero.enrollmentBannerEn} onChange={v => setHero(h => ({ ...h, enrollmentBannerEn: v }))} />
          <Field label="Enrollment Banner (Khmer)" value={hero.enrollmentBannerKh} onChange={v => setHero(h => ({ ...h, enrollmentBannerKh: v }))} />
          <Field label="Subtitle (English)" value={hero.subtitleEn} onChange={v => setHero(h => ({ ...h, subtitleEn: v }))} multiline />
          <Field label="Subtitle (Khmer)" value={hero.subtitleKh} onChange={v => setHero(h => ({ ...h, subtitleKh: v }))} multiline />
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Hero Image</label>
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={e => void handleImageUpload("hero_image", e.target.files?.[0] ?? null)} className="text-sm" />
              {uploadingKey === "hero_image" && <span className="text-xs text-gray-400">Uploading...</span>}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <SaveButton onSave={() => heroSave.save(JSON.stringify(hero))} saving={heroSave.saving} saved={heroSave.saved} />
        </div>
      </Section>

      {/* Stats */}
      <Section title="Homepage Statistics">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Field label="Students Count" value={stats.studentsCount} onChange={v => setStats(s => ({ ...s, studentsCount: v }))} placeholder="e.g. 1,500+" />
          <Field label="Teachers Count" value={stats.teachersCount} onChange={v => setStats(s => ({ ...s, teachersCount: v }))} placeholder="e.g. 120+" />
          <Field label="Programs Count" value={stats.programsCount} onChange={v => setStats(s => ({ ...s, programsCount: v }))} placeholder="e.g. 15" />
          <Field label="Years of Excellence" value={stats.yearsExcellence} onChange={v => setStats(s => ({ ...s, yearsExcellence: v }))} placeholder="e.g. 25+" />
          <Field label="Graduation Rate" value={stats.graduationRate} onChange={v => setStats(s => ({ ...s, graduationRate: v }))} placeholder="e.g. 98%" />
          <Field label="Commitment Label" value={stats.commitmentLabel} onChange={v => setStats(s => ({ ...s, commitmentLabel: v }))} placeholder="e.g. 100%" />
        </div>
        <div className="flex justify-end">
          <SaveButton onSave={() => statsSave.save(JSON.stringify(stats))} saving={statsSave.saving} saved={statsSave.saved} />
        </div>
      </Section>

      {/* Contact Info */}
      <Section title="Contact Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Phone" value={contact.phone} onChange={v => setContact(c => ({ ...c, phone: v }))} />
          <Field label="Email" value={contact.email} onChange={v => setContact(c => ({ ...c, email: v }))} />
          <Field label="Address (English)" value={contact.addressEn} onChange={v => setContact(c => ({ ...c, addressEn: v }))} />
          <Field label="Address (Khmer)" value={contact.addressKh} onChange={v => setContact(c => ({ ...c, addressKh: v }))} />
          <Field label="Facebook URL" value={contact.facebookUrl} onChange={v => setContact(c => ({ ...c, facebookUrl: v }))} />
        </div>
        <div className="flex justify-end">
          <SaveButton onSave={() => contactSave.save(JSON.stringify(contact))} saving={contactSave.saving} saved={contactSave.saved} />
        </div>
      </Section>

      {/* Mission */}
      <Section title="Mission Statement">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Mission (English)" value={mission.textEn} onChange={v => setMission(m => ({ ...m, textEn: v }))} multiline />
          <Field label="Mission (Khmer)" value={mission.textKh} onChange={v => setMission(m => ({ ...m, textKh: v }))} multiline />
        </div>
        <div className="flex justify-end">
          <SaveButton onSave={() => missionSave.save(JSON.stringify(mission))} saving={missionSave.saving} saved={missionSave.saved} />
        </div>
      </Section>

      {/* Vision */}
      <Section title="Vision Statement">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Vision (English)" value={vision.textEn} onChange={v => setVision(v2 => ({ ...v2, textEn: v }))} multiline />
          <Field label="Vision (Khmer)" value={vision.textKh} onChange={v => setVision(v2 => ({ ...v2, textKh: v }))} multiline />
        </div>
        <div className="flex justify-end">
          <SaveButton onSave={() => visionSave.save(JSON.stringify(vision))} saving={visionSave.saving} saved={visionSave.saved} />
        </div>
      </Section>

      {/* About History */}
      <Section title="About Page — History Text">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Paragraph 1 (English)" value={history.paragraph1En} onChange={v => setHistory(h => ({ ...h, paragraph1En: v }))} multiline />
          <Field label="Paragraph 1 (Khmer)" value={history.paragraph1Kh} onChange={v => setHistory(h => ({ ...h, paragraph1Kh: v }))} multiline />
          <Field label="Paragraph 2 (English)" value={history.paragraph2En} onChange={v => setHistory(h => ({ ...h, paragraph2En: v }))} multiline />
          <Field label="Paragraph 2 (Khmer)" value={history.paragraph2Kh} onChange={v => setHistory(h => ({ ...h, paragraph2Kh: v }))} multiline />
        </div>
        <div className="flex justify-end">
          <SaveButton onSave={() => historySave.save(JSON.stringify(history))} saving={historySave.saving} saved={historySave.saved} />
        </div>
      </Section>

      {/* Leadership */}
      <Section title="School Leadership (About Page)">
        <div className="space-y-4">
          {leadership.map((person, i) => (
            <div key={i} className="border rounded-lg p-4 relative">
              <button onClick={() => setLeadership(ls => ls.filter((_, j) => j !== i))}
                className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
              <p className="text-xs font-bold text-gray-400 mb-3">Leader #{i + 1}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Name (English)" value={person.nameEn} onChange={v => setLeadership(ls => ls.map((l, j) => j === i ? { ...l, nameEn: v } : l))} />
                <Field label="Name (Khmer)" value={person.nameKh} onChange={v => setLeadership(ls => ls.map((l, j) => j === i ? { ...l, nameKh: v } : l))} />
                <Field label="Title (English)" value={person.titleEn} onChange={v => setLeadership(ls => ls.map((l, j) => j === i ? { ...l, titleEn: v } : l))} />
                <Field label="Title (Khmer)" value={person.titleKh} onChange={v => setLeadership(ls => ls.map((l, j) => j === i ? { ...l, titleKh: v } : l))} />
                <Field label="Bio (English)" value={person.descEn} onChange={v => setLeadership(ls => ls.map((l, j) => j === i ? { ...l, descEn: v } : l))} />
                <Field label="Bio (Khmer)" value={person.descKh} onChange={v => setLeadership(ls => ls.map((l, j) => j === i ? { ...l, descKh: v } : l))} />
                <Field label="Photo URL (optional)" value={person.photoUrl} onChange={v => setLeadership(ls => ls.map((l, j) => j === i ? { ...l, photoUrl: v } : l))} placeholder="https://..." />
              </div>
            </div>
          ))}
          <button onClick={() => setLeadership(ls => [...ls, { nameEn: "", nameKh: "", titleEn: "", titleKh: "", descEn: "", descKh: "", photoUrl: "" }])}
            className="flex items-center gap-2 text-sm text-[#1e3a6e] font-semibold border border-dashed border-[#1e3a6e]/40 rounded-lg px-4 py-2 w-full justify-center hover:bg-[#1e3a6e]/5 transition-colors">
            <Plus size={14} /> Add Leader
          </button>
        </div>
        <div className="flex justify-end">
          <SaveButton onSave={() => leadershipSave.save(JSON.stringify(leadership))} saving={leadershipSave.saving} saved={leadershipSave.saved} />
        </div>
      </Section>

      {/* Clubs */}
      <Section title="School Clubs (Activities Page)">
        <div className="space-y-4">
          {clubs.map((club, i) => (
            <div key={i} className="border rounded-lg p-4 relative">
              <button onClick={() => setClubs(cs => cs.filter((_, j) => j !== i))}
                className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
              <p className="text-xs font-bold text-gray-400 mb-3">Club #{i + 1}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Title (English)" value={club.titleEn} onChange={v => setClubs(cs => cs.map((c, j) => j === i ? { ...c, titleEn: v } : c))} />
                <Field label="Title (Khmer)" value={club.titleKh} onChange={v => setClubs(cs => cs.map((c, j) => j === i ? { ...c, titleKh: v } : c))} />
                <Field label="Description (English)" value={club.descEn} onChange={v => setClubs(cs => cs.map((c, j) => j === i ? { ...c, descEn: v } : c))} multiline />
                <Field label="Description (Khmer)" value={club.descKh} onChange={v => setClubs(cs => cs.map((c, j) => j === i ? { ...c, descKh: v } : c))} multiline />
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Color Theme</label>
                  <select value={club.color} onChange={e => setClubs(cs => cs.map((c, j) => j === i ? { ...c, color: e.target.value } : c))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {CLUB_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => setClubs(cs => [...cs, { titleEn: "", titleKh: "", descEn: "", descKh: "", color: CLUB_COLORS[cs.length % CLUB_COLORS.length] ?? CLUB_COLORS[0]! }])}
            className="flex items-center gap-2 text-sm text-[#1e3a6e] font-semibold border border-dashed border-[#1e3a6e]/40 rounded-lg px-4 py-2 w-full justify-center hover:bg-[#1e3a6e]/5 transition-colors">
            <Plus size={14} /> Add Club
          </button>
        </div>
        <div className="flex justify-end">
          <SaveButton onSave={() => clubsSave.save(JSON.stringify(clubs))} saving={clubsSave.saving} saved={clubsSave.saved} />
        </div>
      </Section>

      {/* Academic Programs */}
      <Section title="Academic Programs (Academics Page)">
        <div className="space-y-4">
          {programs.map((prog, i) => (
            <div key={i} className="border rounded-lg p-4 relative">
              <button onClick={() => setPrograms(ps => ps.filter((_, j) => j !== i))}
                className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
              <p className="text-xs font-bold text-gray-400 mb-3">Program #{i + 1}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Title (English)" value={prog.titleEn} onChange={v => setPrograms(ps => ps.map((p, j) => j === i ? { ...p, titleEn: v } : p))} />
                <Field label="Title (Khmer)" value={prog.titleKh} onChange={v => setPrograms(ps => ps.map((p, j) => j === i ? { ...p, titleKh: v } : p))} />
                <Field label="Description (English)" value={prog.descEn} onChange={v => setPrograms(ps => ps.map((p, j) => j === i ? { ...p, descEn: v } : p))} multiline />
                <Field label="Description (Khmer)" value={prog.descKh} onChange={v => setPrograms(ps => ps.map((p, j) => j === i ? { ...p, descKh: v } : p))} multiline />
              </div>
            </div>
          ))}
          <button onClick={() => setPrograms(ps => [...ps, { titleEn: "", titleKh: "", descEn: "", descKh: "" }])}
            className="flex items-center gap-2 text-sm text-[#1e3a6e] font-semibold border border-dashed border-[#1e3a6e]/40 rounded-lg px-4 py-2 w-full justify-center hover:bg-[#1e3a6e]/5 transition-colors">
            <Plus size={14} /> Add Program
          </button>
        </div>
        <div className="flex justify-end">
          <SaveButton onSave={() => programsSave.save(JSON.stringify(programs))} saving={programsSave.saving} saved={programsSave.saved} />
        </div>
      </Section>
    </div>
  );
}
