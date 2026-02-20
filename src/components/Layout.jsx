import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, user, view, setView }) => (
  <div className="layout-bg">
    {/* <Header user={user} view={view} setView={setView} /> */}
    <main className="layout-main">
      {children}
    </main>
    {/* <Footer /> */}
  </div>
);

export default Layout;
