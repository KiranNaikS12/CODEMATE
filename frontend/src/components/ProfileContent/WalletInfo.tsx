import React, { useEffect, useState } from 'react';
import { 
    Wallet, 
    Zap, 
    Gift, 
    Shield, 
    CreditCard,
    ArrowRight,
    PlusCircle,
    ArrowDownCircle,
    ArrowUpCircle,
    Calendar
} from 'lucide-react';
import { useActivateWalletMutation, useGetWalletDetailsQuery } from '../../services/userApiSlice';
import { APIError } from '../../types/types';
import Swal from 'sweetalert2';
import { IWallet } from '../../types/walletTypes';
import Spinner from '../Loader/Spinner';
import WalletPaymentModal from '../Modals/WalletPaymentModal';
import usePriceCalculations from '../../hooks/usePriceCalculation';
import { useNavigate } from 'react-router-dom';


export interface WalletInfoProps {
    userId?: string;     
}

const WalletInfo: React.FC<WalletInfoProps> = ({userId}) => {
    const [walletDetails, setWalletDetails] = useState<IWallet | null >(null);
    const [showPaymentModal, setShowPayementModal] = useState(false)
    const [ activateWallet ] = useActivateWalletMutation();
    const { data: walletData, isLoading, refetch: refetchWallet } = useGetWalletDetailsQuery(userId!);
    const { formatPrice } = usePriceCalculations();
    const navigate = useNavigate();

    useEffect(() => {
        if(walletData) {
            setWalletDetails(walletData.data)
        }
    }, [walletData])
    
    const handleActivateWallet = async(userId: string) => {
        try {
            const response = await activateWallet(userId).unwrap();
            setWalletDetails(response.data);
            await refetchWallet(); 
            Swal.fire({
                icon: 'success',
                title: 'Wallet Activated!',
                text: response.message,
                confirmButtonColor: '#3085d6',
            }).then((result) => {
                if(result.isConfirmed) {
                    navigate('/course')
                }
            });
        } catch (error) {
            const apiError = error as APIError;
            if(apiError.data && apiError.data.message) {
                Swal.fire({
                    icon: 'error',
                    title: 'Activation Failed!',
                    text: apiError.data.message,
                    confirmButtonColor: '#d33',
                });
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full h-[calc(100vh-190px)]">
                <Spinner isLoading = {isLoading}/>
            </div>
        );
    }

    const openPaymentModal = () => {
        setShowPayementModal(true)
    }

    const closePaymentModal = () => {
        setShowPayementModal(false);
    }
    
    const benefits = [
        {
          icon: <Zap className="w-6 h-6 text-yellow-500" />,
          title: "Lightning Fast Payments",
          description: "Complete your course purchases in seconds with pre-loaded wallet balance"
        },
        {
          icon: <Gift className="w-6 h-6 text-purple-500" />,
          title: "Exclusive Rewards",
          description: "Get access to special discounts and cashback offers on wallet transactions and get rupees '100 bonus' on first activation"
        },
        {
          icon: <Shield className="w-6 h-6 text-green-500" />,
          title: "Secure Transactions",
          description: "Your money is safe with our bank-grade security measures"
        },
        {
          icon: <CreditCard className="w-6 h-6 text-blue-500" />,
          title: "Easy Refunds",
          description: "Instant refunds directly to your wallet balance"
        }
    ];


    const WalletActivationView = () => (
        <>
            <div className="flex flex-col items-center mb-2 text-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-30"></div>
                    <Wallet className="relative w-16 h-16 mb-4 text-gray-700" />
                </div>
                <h1 className="mb-4 text-2xl font-bold text-gray-700 md:text-3xl">
                    Activate Your Digital Wallet
                </h1>
                <p className="max-w-md mb-4 text-gray-600">
                    Experience seamless payments and exclusive benefits with your personal digital wallet 
                </p>
            </div>

            <div className="flex justify-center">
                <div className="grid justify-center w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
                    {benefits.map((benefit, index) => (
                        <div 
                            key={index}
                            className="flex p-6 transition-shadow bg-gradient-to-br from-gray-100 to-customGrey rounded-xl hover:shadow-xl"
                        >
                            <div className="flex-shrink-0 mr-4">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    {benefit.icon}
                                </div>
                            </div>
                            <div>
                                <h3 className="mb-1 text-lg font-semibold text-gray-800">
                                    {benefit.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {benefit.description}
                                </p>
                            </div>
                        </div>  
                    ))}
                </div> 
            </div>

            <div className="flex justify-center w-full mt-5">
                <button
                    onClick={() => handleActivateWallet(userId!)}
                    className="flex items-center px-6 py-3 text-white transition-all transform rounded-lg bg-themeColor group hover:bg-highlightBlue hover:scale-105"
                >
                    Activate Now
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </button>
            </div>
        </>
    );


    const WalletDetailsView = () => (
        <>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-lg font-medium md:text-xl">My Wallet</h1>
                <button 
                    onClick={openPaymentModal} 
                    className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Money
                </button>
            </div>

            {showPaymentModal && (
                <WalletPaymentModal onClose = {closePaymentModal} id = {userId}/>
            )}

            <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
                <div className="p-6 rounded-lg shadow-sm bg-gradient-to-br from-blue-100 to-blue-300">
                    <div className="flex flex-col items-center">
                        <Wallet className="w-8 h-8 mb-2 text-blue-600" />
                        <p className="text-sm text-gray-600">Current Balance</p>
                        <p className="text-2xl font-semibold text-blue-600">
                            ₹{walletDetails?.walletBalance?.toLocaleString() || 0}
                        </p>
                    </div>
                </div>

                <div className="p-6 rounded-lg shadow-sm bg-gradient-to-br from-green-100 to-green-300">
                    <div className="flex flex-col items-center">
                        <ArrowDownCircle className="w-8 h-8 mb-2 text-green-600" />
                        <p className="text-sm text-gray-600">Total Spent</p>
                        <p className="text-2xl font-semibold text-green-600">
                            ₹{walletDetails?.totalSpent?.toLocaleString() || 0}
                        </p>
                    </div>
                </div>

                <div className="p-6 rounded-lg shadow-sm bg-gradient-to-br from-purple-100 to-purple-300">
                    <div className="flex flex-col items-center">
                        <ArrowUpCircle className="w-8 h-8 mb-2 text-purple-600" />
                        <p className="text-sm text-gray-600">Total Purchases</p>
                        <p className="text-2xl font-semibold text-purple-600">
                            {walletDetails?.totalPurchases || 0}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-white rounded-lg">
                <h2 className="mb-4 text-lg font-medium">Recent Transactions</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Transaction ID</th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Transaction Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {walletDetails?.transactions.map((transaction) => (
                            <tr 
                                key={transaction._id} 
                            >
                                <td className="px-6 py-4 text-sm font-medium text-gray-400 whitespace-nowrap">{transaction.transactionId}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                    <div className='flex items-center gap-2'>
                                        <Calendar className="w-4 h-4"/>  
                                        {new Date(transaction.date).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-400 whitespace-nowrap">
                                    <span
                                        className={`text-sm font-medium ${
                                        transaction.type === 'credit'
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }`}
                                    >
                                        {formatPrice(transaction.amount)}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            transaction.type === 'credit'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                        {transaction.type === 'credit' ? 'Credited' : 'Debited'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        transaction.status === 'completed' 
                                        ? 'bg-green-100 text-green-800'
                                        : transaction.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {transaction.status}
                                    </span>
                                </td>
                            </tr>
                         ))}
                    </tbody>
                </table>
            </div>
        </div>
        </>
    );

    return (
        <div className="flex flex-col w-full overflow-y-auto text-sm bg-white rounded-lg shadow-lg md:w-3/4 md:text-base md:h-[calc(100vh-190px)] p-8">
            {!walletDetails?.isActive ? <WalletActivationView /> : <WalletDetailsView />}
        </div>
    );
};

export default WalletInfo;