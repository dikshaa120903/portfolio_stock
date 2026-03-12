import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const BaseLayout = () => {
    return (
        <div className="min-h-screen bg-[var(--bg-color)] transition-colors duration-300 flex">
            <Sidebar />
            <div className="flex-1 md:ml-72 flex flex-col min-h-screen pt-4 px-4 overflow-x-hidden">
                <Topbar />
                <main className="flex-1 pb-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default BaseLayout;
