import { createBrowserRouter } from "react-router";

import { AdminPage } from "@/features/admin";
import { ArtistsPage } from "@/features/artists";
import { HomePage } from "@/features/home";
import { SearchPage } from "@/features/search";
import { RootLayout } from "@/layouts/root-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "artists", element: <ArtistsPage /> },
      { path: "search", element: <SearchPage /> },
    ],
  },
]);
