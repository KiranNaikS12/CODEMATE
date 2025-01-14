import React, { useEffect, useState } from 'react';
import Header from '../../components/Headers/Header'
import { FaStar } from 'react-icons/fa'
import usePriceCalculations from '../../hooks/usePriceCalculation'
import { CheckCircle, CreditCard, DollarSign, Wallet, XCircle } from 'lucide-react'
import { useCreateCheckoutSessionMutation, useListCartItemsQuery, usePayWithWalletMutation } from '../../services/userApiSlice'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from "yup";
import { toast, Toaster } from 'sonner';
import Swal from 'sweetalert2';
import { APIError } from '../../types/types';
import Modal from 'react-modal';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');


const UserCheckoutPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [originalPrice, setOriginalPrice] = useState(0);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
    const { formatPrice, calculateDiscountPrice } = usePriceCalculations();
    const [createCheckoutSession] = useCreateCheckoutSessionMutation();
    const [walletPayment] = usePayWithWalletMutation();
    const { data: cartResponse } = useListCartItemsQuery({ userId: id! }, { skip: !id });
    const cartDetails = cartResponse?.data;
    const navigate = useNavigate()

    useEffect(() => {
        if (cartDetails?.items) {
            const totalOriginalPrice = cartDetails?.items.reduce(
                (total, item) => total + item.course.price, 0
            );
            setOriginalPrice(totalOriginalPrice)
        }
    }, [cartDetails]);

    const discountPrice = (originalPrice - (cartDetails?.cartTotal || 0));


    const validationSchema = Yup.object({
        paymentGateway: Yup.string().required('Please select any one of payment method to procced')
    });

    const handleStripeCheckout = async (values: { paymentGateway: string }) => {
        try {
            const stripe = await stripePromise;
            if (!stripe) {
                console.error('Stripe failed to initialize');
                return;
            }
            try {
                const response = await createCheckoutSession({ userId: id, paymentGateway: values.paymentGateway }).unwrap();
                if (response.data) {
                    window.location.href = response.data;
                }

            } catch (error) {
                const apiError = error as APIError;
                if (apiError.data?.message) {
                    toast.error(apiError.data?.message)
                }
            }
        } catch (error) {
            console.error('Error in Stripe Checkout:', error);
        }
    };


    const handleCheckout = async (values: { paymentGateway: string }) => {
        if (values.paymentGateway === 'wallet') {
            setIsWalletModalOpen(true);
        } else {
            try {
                switch (values.paymentGateway) {
                    case 'stripe':
                        await handleStripeCheckout(values);
                        break;
                    case 'razorpay':
                        alert('Currently not in service. Choose another payment method.');
                        break;
                    default:
                        toast('Invalid payment gateway selected');
                }
            } catch (error) {
                console.error('Payment processing error:', error);
            }
        }
    };

    const handleWalletPayment = async () => {
        try {
            const response = await walletPayment({
                userId: id,
                paymentGateway: 'wallet'
            }).unwrap();

            setIsWalletModalOpen(false);

            if (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Payment Successful! Now you can access you course',
                    text: response.message,
                    confirmButtonColor: '#3085d6',
                }).then(() => {
                    navigate(`/enroll-course/${id}`)
                });
            }
            
        } catch (error) {
            const apiError = error as APIError;
            if (apiError.data && apiError.data.message) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Payment Failed',
                    text: apiError.data.message,
                    confirmButtonColor: '#d33',
                });
            }
        } finally {
            setIsWalletModalOpen(false);
        }
    }

    if (!cartDetails || !cartDetails.items || cartDetails.items.length === 0) {
        return (
            <div className="flex flex-col w-full min-h-screen bg-customGrey">
                <Header />
                <div className="relative flex flex-col items-center mt-20 justify-evenly">
                    <img
                        src="/not_found.png"
                        alt="not_found"
                        className="w-96 h-w-96"
                    />
                    <div className='mb-6 text-3xl font-light text-gray-400'>
                        <p>NO ORDER HISTORY FOUND</p>
                    </div>
                    <div>
                        <Link to='/course'>
                            <button className="px-3 py-2 rounded-lg shadow-inner bg-themeColor text-customGrey">
                                Order Now
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full min-h-screen bg-customGrey">
            <Header />
            <Toaster
                position="top-center"
                richColors
            />
            <div className='flex items-end mt-2 just ml-36 gap-x-1'>
                <h1 className="text-2xl font-medium text-themeColor bg-customGrey">ORDER SUMMARY</h1>
            </div>
            <Formik
                initialValues={{ paymentGateway: '' }}
                validationSchema={validationSchema}
                onSubmit={handleCheckout}
            >
                {({ values, setFieldValue }) => (
                    <Form>
                        <div className="flex flex-col items-start justify-center pt-2 pl-4 pr-4 mt-4 sm:flex-row lg:pr-36 lg:pl-36 gap-x-4 gap-y-4">
                            <div className="flex flex-col w-full gap-4 mb-4 basis-3/4">
                                {cartDetails?.items.map((item) => (
                                    <div key={item._id} className="flex w-full overflow-hidden rounded-lg gap-x-2">
                                        <div className='flex gap-x-4'>
                                            <div className="">
                                                <img src={item.course.coverImage} alt={item.course.title} className="w-48 rounded-lg h-28" />
                                            </div>
                                        </div>
                                        <div className="relative flex flex-col justify-between w-full gap-y-2">
                                            <div>
                                                <div className='flex items-start justify-between w-full '>
                                                    <h1 className="text-xl font-medium text-themeColor">{item.course.title}</h1>

                                                </div>
                                                <h1 className='text-sm text-highlightBlue'>Mentor: {item.course.tutorName}</h1>
                                                <h1 className='flex items-center text-sm text-gray-500'>
                                                    Ratings: <span className='ml-1 text-gray-500'> 4.5</span><FaStar style={{ color: 'yellow' }} />
                                                </h1>
                                            </div>
                                            <div className='flex gap-x-2'>
                                                <button className='text-blue-500'>
                                                    Save for later
                                                </button>
                                                <div className="w-px h-6 bg-gray-400"></div>
                                                <button className='text-red-500'>
                                                    Remove
                                                </button>
                                            </div>
                                            <div className='absolute flex flex-col right-2'>
                                                <h1 className='text-gray-400 line-through'>{formatPrice(item.course.price)}</h1>
                                                <h1 className='text-lg font-medium text-green-500'>{formatPrice(calculateDiscountPrice(item.course.price, item.course.discount))}</h1>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {/* payment-option-section */}
                                <div className='flex flex-col w-full gap-4 mt-12 mb-4 basis-3/4'>
                                    <div className='flex items-center gap-x-1'>
                                        <h1 className='text-xl text-themeColor'>Payment Options</h1>
                                        <h1 className='text-sm text-blue-500'>(choose any one of the following)</h1>
                                    </div>
                                    <ErrorMessage
                                        name='paymentGateway'
                                        component='div'
                                        className='text-sm italic text-red-500'
                                    />
                                    <div className='space-y-4 '>

                                        {/* stripe option */}
                                        <label className="relative flex items-center p-4 cursor-pointer group">
                                            <Field
                                                type="radio"
                                                name="paymentGateway"
                                                value="stripe"
                                                checked={values.paymentGateway === 'stripe'}
                                                onChange={() => setFieldValue('paymentGateway', 'stripe')}
                                                className="w-5 h-5 transition-all border-2 border-gray-300 rounded-full cursor-pointer checked:border-blue-500 checked:border-6"
                                            />
                                            <div className="flex items-center ml-4 gap-x-4">
                                                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                                                    <DollarSign className="w-6 h-6 text-green-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Stripe</p>
                                                    <p className="text-sm text-gray-500">Pay securely with credit/debit card</p>
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 transition-all border-2 border-gray-200 rounded-lg group-hover:border-green-300" />
                                        </label>

                                        {/* razorpay-payment*/}
                                        <label className="relative flex items-center p-4 cursor-pointer group">
                                            <Field
                                                type="radio"
                                                name="paymentGateway"
                                                value="razorpay"
                                                checked={values.paymentGateway === 'razorpay'}
                                                onChange={() => setFieldValue('paymentGateway', 'razorpay')}
                                                className="w-5 h-5 transition-all border-2 border-gray-300 rounded-full cursor-pointer checked:border-blue-500 checked:border-6"
                                            />
                                            <div className="flex items-center ml-4 gap-x-4">
                                                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                                                    <CreditCard className="w-6 h-6 text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Razorpay</p>
                                                    <p className="text-sm text-gray-500">Pay securely with credit/debit card</p>
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 transition-all border-2 border-gray-200 rounded-lg group-hover:border-blue-300" />
                                        </label>

                                        {/* Wallet Option */}
                                        <label className="relative flex items-center p-4 cursor-pointer group">
                                            <Field
                                                type="radio"
                                                name="paymentGateway"
                                                value="wallet"
                                                checked={values.paymentGateway === 'wallet'}
                                                onChange={() => setFieldValue('paymentGateway', 'wallet')}
                                                className="w-5 h-5 transition-all border-2 border-gray-300 rounded-full cursor-pointer checked:border-blue-500 checked:border-6"
                                            />
                                            <div className="flex items-center ml-4 gap-x-4">
                                                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                                                    <Wallet className="w-6 h-6 text-green-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Wallet</p>
                                                    <p className="text-sm text-gray-500">Pay using your digital wallet</p>
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 transition-all border-2 border-gray-200 rounded-lg group-hover:border-green-300" />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* price-details-section */}
                            <div className="rounded-lg sm:w-[400px] w-full space-y-3">
                                <div className="flex flex-col overflow-hidden rounded-lg ">
                                    <div className="p-4 border-b border-gray-100">
                                        <h1 className="text-lg font-semibold text-themeColor">Price Details</h1>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        {/* Price Breakdown */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Original Price <span className='text-sm text-gray-500'>(items: {cartDetails?.items.length})</span></span>
                                                <span className="font-medium">{formatPrice(originalPrice || 0)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-green-600">
                                                <span>Total Discount</span>
                                                <span>- {formatPrice(discountPrice)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-gray-600">
                                                <span>Platform Fee</span>
                                                <span>+ ₹15</span>
                                            </div>
                                            <div className="pt-3 border-t border-gray-200 border-dashed">
                                                <div className="flex items-center justify-between text-lg font-semibold">
                                                    <span>Total cost:</span>
                                                    <span className="text-themeColor">{formatPrice((cartDetails?.cartTotal || 0) + 15)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Proceed Button */}
                                        <button className="w-full py-3 bg-green-500 text-white rounded-md font-medium hover:bg-green-600 transform transition-all duration-200 hover:shadow-lg active:scale-[0.98] mt-4"
                                            type='submit'
                                        >
                                            Proceed to Payment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
            {isWalletModalOpen && (
                <Modal
                    isOpen={isWalletModalOpen}
                    onRequestClose={() => setIsWalletModalOpen(false)}
                    className="fixed inset-0 flex items-center justify-center p-4"
                    overlayClassName="fixed inset-0 bg-black bg-opacity-50"
                >
                    <div className="w-full max-w-2xl overflow-hidden bg-white shadow-2xl rounded-2xl">
                        <div className="p-6 bg-gradient-to-r from-themeColor to-highlightBlue">
                            <h2 className="flex items-center text-2xl font-bold text-white gap-x-3">
                                <Wallet className="w-8 h-8" />
                                Confirm Wallet Payment
                            </h2>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50">
                                <div>
                                    <h3 className="text-lg font-semibold text-green-800">Total Payable Amount</h3>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatPrice((cartDetails?.cartTotal || 0) + 15)}
                                    </p>
                                </div>
                                <CheckCircle className="w-12 h-12 text-green-500" />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Cart Total</span>
                                    <span>{formatPrice(cartDetails?.cartTotal || 0)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Platform Fee</span>
                                    <span>+ ₹15</span>
                                </div>
                            </div>

                            <div className="flex justify-between gap-4">
                                <button
                                    onClick={() => setIsWalletModalOpen(false)}
                                    className="flex items-center justify-center flex-1 py-3 text-gray-800 transition-all duration-300 bg-gray-200 rounded-lg hover:bg-gray-300 gap-x-2"
                                >
                                    <XCircle className="w-5 h-5" /> Cancel
                                </button>
                                <button
                                    onClick={handleWalletPayment}
                                    className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-x-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Wallet className="w-5 h-5" /> Confirm Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}

export default UserCheckoutPage
