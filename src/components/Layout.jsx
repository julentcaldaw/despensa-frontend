import React from 'react';

const Layout = ({ children }) => (
  <div className="layout-bg">
    <main className="layout-main">
      {children}
    </main>
  </div>
);

export default Layout;
