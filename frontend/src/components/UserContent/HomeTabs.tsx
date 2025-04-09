import React, { useState, useEffect, useRef } from 'react';
import RecentActivityList from './RecentActivityList';
import { UserAdditional } from '../../types/userTypes';

export interface HomeTabsProps {
    user: UserAdditional
}

const HomeTabs: React.FC<HomeTabsProps> = ({user}) => {
    const submissionData = user?.totalSubmission;
    const recentTabRef = useRef<HTMLDivElement | null>(null);
    const leaderBoardTabRef = useRef<HTMLDivElement | null>(null);
    const [activeTab, setActiveTab] = useState('Recent');
    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
    };

    useEffect(() => {
        // Focus or scroll to the active tab content
        if (activeTab === 'Recent' && recentTabRef.current) {
            recentTabRef.current.scrollIntoView({ behavior: 'smooth' });
        } else if (activeTab === 'LeaderBoard' && leaderBoardTabRef.current) {
            leaderBoardTabRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeTab]);


    return (
        <div className="mt-2 mb-10">
            <div className="flex px-6 space-x-8 border-b border-gray-300 md:px-0">
                <button
                    className={`py-2 text-lg font-medium ${
                        activeTab === 'Recent'
                            ? 'text-blue-500 underline font-semibold text-xl'
                            : 'text-gray-500'
                    }`}
                    onClick={() => handleTabClick('Recent')}
                >
                    Recent Activity
                </button>
                <button
                    className={`py-2 text-lg font-medium ${
                        activeTab === 'LeaderBoard'
                            ? 'text-blue-500 underline font-semibold text-xl'
                            : 'text-gray-500'
                    }`}
                    onClick={() => handleTabClick('LeaderBoard')}
                >
                    Leader Board
                </button>
            </div>

            <div className="mt-3">
                {activeTab === 'Recent' && (
                    <div ref = {recentTabRef}>
                        <RecentActivityList submissionData = {submissionData!}/>
                    </div>
                )}
                {activeTab === 'LeaderBoard' && (
                    <div ref = {leaderBoardTabRef}>
                        <p>This is the place for displaying table contents based on rankings.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeTabs;
