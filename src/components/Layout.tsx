import { NavLink, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { Footer } from './Footer';

const navLinkBase =
  'min-h-11 flex shrink-0 items-center justify-center rounded-full px-4 text-sm font-bold whitespace-nowrap transition';
const navLinkActive = 'bg-open-600 text-white';
const navLinkInactive = 'bg-navy-800 text-slate-300';

export function Layout() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const sport = searchParams.get('sport') ?? 'Baseball';
  const isHome = location.pathname === '/';

  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print sticky top-0 z-40 border-b border-navy-800 bg-navy-950/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 pt-5 pb-3">
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">TOPPS ACCESS FINDER</h1>
          <p className="mt-1 text-sm text-slate-400">
            Find eligible Topps products. Generate your mail-in. Never miss a deadline.
          </p>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <NavLink to="/?sport=Baseball" className={`${navLinkBase} ${isHome && sport === 'Baseball' ? navLinkActive : navLinkInactive}`}>
              Baseball
            </NavLink>
            <NavLink to="/?sport=All" className={`${navLinkBase} ${isHome && sport === 'All' ? navLinkActive : navLinkInactive}`}>
              All Sports
            </NavLink>
            <NavLink
              to="/my-entries"
              className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`}
            >
              My Entries
            </NavLink>
            <NavLink
              to="/calendar"
              className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`}
            >
              Calendar
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
