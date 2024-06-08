import React, { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <header>
        <h1>DeFi Application</h1>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
