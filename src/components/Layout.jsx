import React from 'react';


const Layout = ({ children }) => (
  <div className="layout-bg">
    {/* <header style={{ width: '100%', textAlign: 'center', margin: '2rem 0 1.5rem 0' }}>
      <img src="/logoA.png" alt="Logo" className="max-w-[180px] w-full h-auto" />
    </header> */}
    <main className="layout-main">
      {children}
    </main>
  </div>
);

export default Layout;
