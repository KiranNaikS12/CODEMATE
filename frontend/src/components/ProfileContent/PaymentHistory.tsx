import React, {useState} from 'react';
import { 
  Search,
  CreditCard,
  Calendar,
  ChevronUp,
  ChevronDown,
  RefreshCcwIcon
} from 'lucide-react';
import { useListOrderHistoryQuery } from '../../services/userApiSlice';
import { IOrder } from '../../types/orderTypes';

import usePriceCalculations from '../../hooks/usePriceCalculation';
import PaymentRetryModal from '../Modals/PaymentRetryModal';
import { Link } from 'react-router-dom';


interface PaymentHistroyProps {
    userId?: string
}

const PaymentHistory: React.FC<PaymentHistroyProps> = ({ userId }) => {
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [showRetryModal, setShowRetryModal] = useState(false);
    const [page, setPage] = useState(1)
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const { data: orderResponse, refetch } = useListOrderHistoryQuery({ userId: userId!, page, limit: 6 }, { skip: !userId });
    const orderDetails = orderResponse?.data?.orders || [];
    const totalPage = orderResponse?.data?.totalPagesCount || 0;
    const { formatPrice } = usePriceCalculations();

  
    const toggleOrderDetails = (orderId: string) => {
      setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const openRetryModal = (orderId: string) => {
        setSelectedOrderId(orderId);
        setShowRetryModal(true);
    };

    const closeRetryModal = () => {
        setShowRetryModal(false);
        setSelectedOrderId(null);
    };
  
    return (
      <div className="flex flex-col w-full overflow-y-auto text-sm bg-white rounded-lg shadow-lg md:w-3/4 md:text-base md:h-[calc(100vh-190px)] p-8 ">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-medium md:text-xl">PAYMENT HISTORY</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input 
                type="text"
                placeholder="Search transactions..."
                className="py-2 pl-10 pr-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
  
        {/* Table Header */}
        <div className="-ml-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Payment ID
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                       Date
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                       Amount
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                       Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Items
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Action
                    </th>
                </tr>
            </thead>

            
            {/* Table Body */}
            <tbody className="bg-white divide-y divide-gray-200">
                {orderDetails.map((payment: IOrder) => (
                <React.Fragment key={payment._id}>
                    <tr>
                        {/* PaymentID */}
                        <td className="px-6 py-4 text-sm font-medium text-gray-400 whitespace-nowrap">
                            {payment.paymentId ? payment.paymentId : 'N/A'}
                        </td>

                        {/* PaymnetDate */}
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(payment.createdAt).toLocaleDateString()}
                            </div>
                        </td>

                        {/* Payment Amount */}
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {formatPrice(payment.billTotal)}
                        </td>

                        {/* Payment Status */}
                        <td className="flex items-center px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                payment.paymentStatus === 'Success' ? 'bg-green-100 text-green-800' :
                                payment.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {payment.paymentStatus}
                            </span>
                            {(payment.paymentStatus === 'Failed' || payment.paymentStatus === 'Pending') && (
                            <span
                                onClick={() => openRetryModal(payment._id)} 
                                className="ml-1 text-blue-600 cursor-pointer"
                                title="Retry Payment"
                            >
                                <RefreshCcwIcon size={14}/>
                            </span>
                            )}
                        </td>
                        {/* Retry Modal */}
                        {showRetryModal && selectedOrderId &&(
                            <PaymentRetryModal   order_id = {selectedOrderId} userId = {payment.user} onClose = {closeRetryModal}  refetch = {refetch}/>
                        )}

                        {/* Total items */}
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {payment.items.length} courses
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                               <CreditCard className="w-4 h-4" />
                               {payment.paymentGateway}
                            </div>
                        </td>

                        {/* Table Action */}
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                           <button
                                onClick={() => toggleOrderDetails(payment._id)}
                                className="flex items-center text-blue-500 hover:text-blue-700"
                            >
                            {expandedOrder === payment._id ? (
                                <>Hide Details <ChevronUp className="w-4 h-4 ml-1" /></>
                            ) : (
                               <>View Details <ChevronDown className="w-4 h-4 ml-1" /></>
                            )}
                            </button>
                        </td>
                    </tr>

                    {/* Expanded Order */}
                    {expandedOrder === payment._id && (
                    <tr>
                        <td colSpan={7} className="px-6 py-4">
                            <div className="p-4 rounded-lg bg-gray-50">
                                <h4 className="mb-2 font-medium">Purchased Courses:</h4>
                                <div className="space-y-4">
                                    {payment.items.map((item) => (
                                    <div key={item._id} className="flex items-start w-full gap-4 p-3 bg-white rounded-md">
                                        <img
                                            src={item.course.coverImage}
                                            alt={item.course.title}
                                            className="object-cover h-20 rounded w-36"
                                        />
                                        <div className='w-full'>
                                            <div className='flex items-center justify-between w-full'>
                                                <h5 className="font-medium">{item.course.title}</h5>
                                                {payment.paymentStatus === 'Success' && ( 
                                                    <Link to = {`/access-course/${item.course._id}`} >
                                                    <button className='px-2 py-1 text-sm bg-green-300 rounded-full hover:bg-green-400 hover:shadow-md '> Access Course</button>
                                                    </Link>  
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">Tutor: {item.course.tutorName}</p>
                                            <p className="text-sm text-gray-600">
                                                Price: {formatPrice(item.course.price)}
                                                {item.course.discount > 0 && (
                                                <span className="ml-2 text-green-600">
                                                    ({item.course.discount}% off)
                                                </span>
                                            )}
                                            </p>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                                <div className="pt-4 mt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">Platform Fee: {formatPrice(payment.platFormfee)}</p>
                                    <p className="text-sm font-medium">Total Amount: {formatPrice(payment.billTotal)}</p>
                                </div>
                            </div>
                        </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {orderDetails.length > 0 && (
                <div className="flex items-center justify-center mt-16">
                    <div className="flex items-center justify-center gap-x-2">
                        {/* Previous Button */}
                        <button
                            disabled={page === 1}
                            onClick={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
                            className={`px-4 py-2 bg-gray-300 rounded-md ${
                                page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-400"
                            }`}
                        >
                            Previous
                        </button>

                        {/* Page Numbers */}
                        <div className="flex gap-2">
                            {[...Array(totalPage)].map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setPage(index + 1)}
                                    className={`px-4 py-2 rounded-md ${
                                        page === index + 1 ? "bg-blue-500 text-white" : "bg-gray-300 hover:bg-gray-400"
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>

                        {/* Next Button */}
                        <button
                            disabled={page === totalPage}
                            onClick={() => setPage((prevPage) => Math.min(prevPage + 1, totalPage))}
                            className={`px-4 py-2 bg-gray-300 rounded-md ${
                                page === totalPage ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-400"
                            }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
      </div>
    );
  };
  
  export default React.memo(PaymentHistory);