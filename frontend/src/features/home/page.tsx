import { UsernameClaim } from "@/features/auth";

export function HomePage() {
  return (
    <>
      <UsernameClaim />
      <div className="p-6">Home</div>
    </>
  );
}
