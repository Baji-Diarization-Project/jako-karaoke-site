import { ListIcon } from "@phosphor-icons/react";

import logoUrl from "@/assets/Baji.factions.Industry.svg";

type HeaderMobileProps = {
  onOpenSidebar: () => void;
};

export function HeaderMobile({ onOpenSidebar }: HeaderMobileProps) {
  return (
    <header id="header-mobile" className="header-mobile md:hidden">
      <div>
        <button
          onClick={onOpenSidebar}
          type="button"
          className="header-mobile-btn"
          aria-label="Open Navigation"
        >
          <ListIcon size={28} />
        </button>
      </div>

      <div className="flex flex-1 justify-center">
        <img src={logoUrl} alt="" className="size-10" />
      </div>
    </header>
  );
}
