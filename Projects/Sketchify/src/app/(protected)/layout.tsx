import { UserButton } from "@clerk/nextjs";
import React from "react";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <header className="fixed top-4 right-4 z-50">
        <UserButton />
      </header>
      <main>{children}</main>
    </div>
  );
};

export default ProtectedLayout;