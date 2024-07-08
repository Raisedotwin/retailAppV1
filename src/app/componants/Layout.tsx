import React from 'react';
import NavBar from './NavBar';

const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <NavBar />
    <main className="flex-grow p-10">{children}</main>
  </div>
);

export default Layout;
