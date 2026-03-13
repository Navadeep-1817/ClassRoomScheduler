import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function TopBar() {
  const user = JSON.parse(localStorage.getItem('user'));

  const roleColors = {
    Admin: 'bg-violet-100 text-violet-700',
    Coordinator: 'bg-blue-100 text-blue-700',
    Faculty: 'bg-emerald-100 text-emerald-700',
  };
  const badgeClass = roleColors[user?.role] || 'bg-slate-100 text-slate-600';

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-sm">
      <div>
        <h1 className="text-slate-800 font-semibold text-base">
          Welcome back,&nbsp;
          <span className="text-indigo-600">{user?.username}</span>
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition">
          <BellIcon className="w-5 h-5 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <UserCircleIcon className="w-8 h-8 text-slate-400" />
          <div>
            <p className="text-slate-800 text-sm font-medium leading-none">{user?.username}</p>
            <span className={`badge mt-1 ${badgeClass}`}>{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
