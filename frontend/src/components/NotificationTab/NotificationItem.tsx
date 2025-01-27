import React, { useState } from 'react'
import { INotification } from '../../types/notificationTypes'
import { Clock, MessageSquareText, X } from 'lucide-react'
import useDateFormatter from '../../hooks/useFormatDate'
import { useRemoveNotificationMutation } from '../../services/userApiSlice'
import { APIError } from '../../types/types'
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion'

export interface NotificationItemProps {
    notification: INotification
}


const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
    const { calculateTimeSince } = useDateFormatter();
    const [remove] = useRemoveNotificationMutation();
    const [isVisible, setIsVisible] = useState<boolean>(true);

    const removeNotification = async (notificationId: string) => {
        setIsVisible(false); 
        setTimeout(async () => {
            try {
                await remove({ notificationId }).unwrap();
            } catch (error) {
                const apiError = error as APIError;
                toast.error(apiError.data?.message);
                setIsVisible(true); 
            }
        }, 300); 
    };

    
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="p-4 transition-all border-b border-gray-300 rounded-lg shadow-md cursor-pointer last:border-b-0 hover:bg-gradient-to-r from-blue-100 to-blue-300"
                >
                    <div className="flex items-start space-x-4">
                        <MessageSquareText className="mt-1 text-blue-600 shadow-sm" size={24} />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-900">{notification.senderName}</h3>
                                <span className="flex items-center text-xs text-gray-500">
                                    <Clock size={14} className="mr-1 text-blue-400" />
                                    {calculateTimeSince(notification.createdAt)}
                                </span>
                                <button
                                    onClick={() => removeNotification(notification._id)}
                                    className="px-1 py-1 text-xs font-medium transition text-themeColor hover:bg-white hover:rounded-full"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-gray-700">
                                {notification.text}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationItem
