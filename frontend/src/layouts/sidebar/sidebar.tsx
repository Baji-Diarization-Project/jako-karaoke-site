import { XIcon } from "@phosphor-icons/react";

import logoUrl from "@/assets/Baji.factions.Industry.svg";
import { AuthDialog } from "@/features/auth";
import { useAuthStore } from "@/store/auth";

import { NavItem } from "./nav-item";
import { UserMenu } from "./user-menu";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <aside
      className={`sidebar h-full w-full shrink-0 flex-col md:flex md:w-60 ${open ? "flex" : "hidden"}`}
    >
      <div className="sidebar-header">
        <img src={logoUrl} alt="" aria-hidden className="sidebar-logo" />
        <span className="sidebar-brand">Karaoke Player</span>

        <button type="button" onClick={onClose} className="cursor-pointer md:hidden">
          <XIcon size={28} />
        </button>
      </div>
      <nav className="sidebar-nav">
        <NavItem to="/" label="Home" />
        <NavItem to="/search" label="Search" />
        <NavItem to="/randomsong" label="Random Songs" />
        <NavItem to="/explore" label="Explore" />
        <NavItem to="/artists" label="Artists" />
        <NavItem to="/playlists" label="Playlists" />
        <NavItem to="/dashboard" label="Dashboard" />
        <div className="nav-divider" />

        <p className="sidebar-section-label">Your Library</p>

        <NavItem to="/favorites" label="Favorites" />
        <NavItem to="/download" label="Download" />
        <NavItem to="/playlists" label="Playlists" />

        <div className="nav-divider" />
      </nav>
      <div className="sidebar-footer">{user ? <UserMenu /> : <AuthDialog />}</div>
    </aside>
  );
}
