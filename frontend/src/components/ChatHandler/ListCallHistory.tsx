import React from 'react'
import { ICallHistory } from '../../types/callHistoryTypes';
import useDateFormatter from '../../hooks/useFormatDate';

export interface ListCallHistoryProps {
    onClose: () => void;
    callHistory: ICallHistory[];
    fullname: string | undefined;
    profile: string | undefined;
}

const getStatusColor = (status: string, senderType: string) => {
    switch(status) {
        case 'accepted':
            return senderType === 'User' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800';
        case 'rejected': return 'bg-red-200 text-red-800';
        case 'sent': return 'bg-red-100 text-gray-800';
        default: return 'bg-gray-200 text-gray-800';
    }
};

const getStatusText = (status: string, senderType: string) => {
    switch(status) {
        case 'accepted':
            return senderType === 'User' ? 'Outgoing' : 'Incoming';
        case 'rejected': return 'Declined';
        case 'sent': return 'Missed';
        default: return status;
    }
};

const ListCallHistory: React.FC<ListCallHistoryProps> = ({ onClose, callHistory, fullname, profile }) => {
    const { formatToISODate } = useDateFormatter();

    return (
        <div className="fixed top-28 right-2 flex flex-col h-[600px] bg-white w-[400px] rounded-lg shadow-lg">
            <div className='flex items-center justify-between p-4 border-b border-gray-300'>
                <h2 className='text-lg font-semibold'>Call History</h2>
                <button 
                    className='px-3 py-2 text-white bg-red-500 rounded-lg'
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
            <div className='flex-grow overflow-y-auto border-b-2 border-gray-300'>
                {callHistory.length === 0 ? (
                    <div className='py-4 text-center text-gray-500'>
                        No call history found
                    </div>
                ) : (
                    <div>
                        {callHistory.map((call) => (
                            <div
                                key={call._id}
                                className='flex items-center justify-between w-full p-4 hover:bg-gray-50'
                            >
                                <div className='flex items-center space-x-3'>
                                    <img src={profile} alt={fullname} className='object-cover border border-black rounded-full w-9 h-9' />
                                    <div className='flex flex-col items-start space-y-1'>
                                        <h1 className='text-gray-600'>{fullname}</h1>
                                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(call.callStatus, call.senderType)}`}>
                                            {getStatusText(call.callStatus, call.senderType)}
                                        </span>
                                    </div>
                                </div>
                                <div className='text-sm text-gray-500'>
                                    {formatToISODate(call.timestamp)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ListCallHistory