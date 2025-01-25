export const getCallStatusForUser = (status: string, senderType: string) => {
    switch(status) {
        case 'accepted':
            return senderType === 'User' ? 'Outgoing' : 'Incoming';
        case 'rejected': return 'Declined';
        case 'sent': return 'Missed';
        default: return status;
    }
};

export const getStatusColor = (status: string, senderType: string) => {
    switch(status) {
        case 'accepted':
            return senderType === 'User' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800';
        case 'rejected': return 'bg-red-200 text-red-800';
        case 'sent': return 'bg-red-100 text-gray-800';
        default: return 'bg-gray-200 text-gray-800';
    }
};

export const getCallStatusForTutor = (status: string, senderType: string) => {
    switch(status) {
        case 'accepted':
            return senderType === 'User' ? 'Incoming' : 'Outgoing';
        case 'rejected': return 'Declined';
        case 'sent': return 'Missed';
        default: return status;
    }
};