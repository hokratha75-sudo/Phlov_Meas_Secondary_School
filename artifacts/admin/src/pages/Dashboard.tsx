import { useGetDashboardStats } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Newspaper, Activity, GraduationCap, Users, Mail, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { token } = useAuth();
  const { data: stats, isLoading } = useGetDashboardStats({
    request: { headers: { Authorization: `Bearer ${token}` } }
  });

  const cards = [
    { label: "News Articles", value: stats?.newsCount ?? 0, icon: Newspaper, color: "bg-blue-50 text-blue-700", border: "border-blue-200" },
    { label: "Activities", value: stats?.activitiesCount ?? 0, icon: Activity, color: "bg-purple-50 text-purple-700", border: "border-purple-200" },
    { label: "Teachers", value: stats?.teachersCount ?? 0, icon: GraduationCap, color: "bg-green-50 text-green-700", border: "border-green-200" },
    { label: "Students", value: stats?.studentsCount ?? 0, icon: Users, color: "bg-amber-50 text-amber-700", border: "border-amber-200" },
    { label: "Unread Messages", value: stats?.unreadContactsCount ?? 0, icon: Mail, color: "bg-red-50 text-red-700", border: "border-red-200" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome back, Admin!</h2>
        <p className="text-gray-500 text-sm mt-1">Treng Secondary School — Management Overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, border }) => (
          <div key={label} className={`bg-white border ${border} rounded-xl p-5 flex items-center gap-4 shadow-sm`}>
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{isLoading ? "—" : value}</p>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-[#1e3a6e]" />
            <h3 className="font-bold text-gray-800">Quick Actions</h3>
          </div>
          <div className="space-y-2">
            {[
              { href: "/news", label: "Add News Article", color: "bg-blue-600" },
              { href: "/activities", label: "Add Activity", color: "bg-purple-600" },
              { href: "/teachers", label: "Add Teacher", color: "bg-green-600" },
              { href: "/students", label: "Add Student", color: "bg-amber-600" },
            ].map(({ href, label, color }) => (
              <a key={href} href={href} className={`flex items-center gap-3 ${color} text-white px-4 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity`}>
                + {label}
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={18} className="text-[#1e3a6e]" />
            <h3 className="font-bold text-gray-800">System Info</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">School</span>
              <span className="font-semibold text-gray-800">Treng Secondary School</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Location</span>
              <span className="font-semibold text-gray-800">Treng District, Stung Treng</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Contact</span>
              <span className="font-semibold text-gray-800">012 345 678</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Website</span>
              <a href="/" target="_blank" className="font-semibold text-[#1e3a6e] hover:underline">View Public Site →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
