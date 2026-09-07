import { ListIcon } from "@phosphor-icons/react";

import logoUrl from "@/assets/Baji.factions.Industry.svg";

type HeaderMobileProps = {
  onOpenSidebar: () => void;
};

export function HeaderMobile({ onOpenSidebar }: HeaderMobileProps) {
  return (
    <header
      id="header-mobile"
      className="flex h-16 shrink-0 items-center bg-neutral-900 px-4 text-white md:hidden"
    >
      <div>
        <button
          onClick={onOpenSidebar}
          type="button"
          className="flex h-10 w-10 cursor-pointer items-center justify-center"
          aria-label="Open Navigation"
        >
          <ListIcon size={28} />
        </button>
      </div>

      <div className="flex flex-1 justify-center">
        <img src={logoUrl} alt="" className="h-10 w-10" />
      </div>
    </header>
  );
}
