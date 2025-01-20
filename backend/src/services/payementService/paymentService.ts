import Stripe from 'stripe';
import { injectable, inject } from 'inversify';
import { AuthMessages } from '../../utils/message';
import { HttpStatusCode } from '../../utils/httpStatusCode';
import { ICart, ICartItem } from '../../types/cartTypes'
import { ICartRepository } from '../../repositories/cart/ICartRepository';
import { CustomError } from '../../utils/customError';
import { IPaymentRepository } from '../../repositories/payment/IPaymentRepository';
import { IUserRepository } from '../../repositories/user/IUserRepository';
import { IOrder, IOrderItems } from '../../types/orderTypes';
import { v4 as uuidv4 } from 'uuid';
import { ICourseRepository } from '../../repositories/course/ICourseRepository';
import { IWalletRepossitory } from '../../repositories/wallet/IWalletRepository';
import { PaymentStat } from '../../types/commonTypes';
import { IPayemntService } from './IPaymentService';
import { UpdateQuery } from 'mongoose';
import { IWallet } from '../../types/walletTypes';


@injectable()
export class PayementService implements IPayemntService {
    constructor(
        @inject('CartRepository') private CartRepository: ICartRepository,
        @inject('PaymentRepository') private PaymentRepository: IPaymentRepository,
        @inject('UserRepository') private UserRepository: IUserRepository,
        @inject('CourseRepository') private CourseRepository: ICourseRepository,
        @inject('WalletRepository') private WalletRepository: IWalletRepossitory,
        @inject('StripeClient') private stripe: Stripe
    ) {

    }

    async createCheckoutSession(userId: string, paymentGateway: string): Promise<string | null> {
        try {
            const userCart = await this.CartRepository.findByWithCart(userId);
            const user = await this.UserRepository.findById(userId);

            if (!user) {
                throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND)
            }

            if (!userCart || !userCart.items || userCart.items.length === 0) {
                throw new CustomError(AuthMessages.CHECKOUT_IS_EMPTY, HttpStatusCode.BAD_REQUEST)
            }

            const courseIds = userCart.items.map((item: ICartItem) => item.course._id);
            const existingSuccessfulOrder = await this.PaymentRepository.findOne({
                user: userId,
                'items.course': { $in: courseIds },
                paymentStatus: 'Success',
                gatewayStatus: true
            });

            if (existingSuccessfulOrder) {
                throw new CustomError(AuthMessages.ORDER_CONFLICT, HttpStatusCode.BAD_REQUEST);
            }


            //validuating pending orders
            const existingOrder = await this.PaymentRepository.findOne({
                user: userId,
                paymentStatus: 'Pending',
                createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
                'items.course': { $in: courseIds }
            })


            if (existingOrder) {
                throw new CustomError(AuthMessages.ORDER_ALREADY_IN_PROGRESS, HttpStatusCode.BAD_REQUEST);
            }

            const orderItems = userCart.items.map((item: ICartItem) => ({
                course: item.course._id,
            }));

            if (orderItems.length === 0) {
                throw new CustomError(AuthMessages.CART_IS_EMPTY, HttpStatusCode.BAD_REQUEST);
            }
            const platFormfee = 15;
            const billTotal = userCart.cartTotal + platFormfee;

            const finalValidation = await this.PaymentRepository.findOne({
                user: userId,
                'items.course': { $in: courseIds },
                paymentStatus: 'Success',
                gatewayStatus: true
            });

            if (finalValidation) {
                throw new CustomError(AuthMessages.ORDER_CONFLICT, HttpStatusCode.BAD_REQUEST);
            }


            const order = await this.PaymentRepository.create({
                cart: userCart._id,
                user: user._id,
                items: orderItems,
                paymentGateway: paymentGateway,
                paymentStatus: 'Pending',
                billTotal,
                platFormfee: platFormfee,
            });

            try {
                const idempotencyKey = `${userId}-${order._id.toString()}`;
                const session = await this.stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: [
                        ...userCart.items.map((item: ICartItem & { course: any }) => ({
                            price_data: {
                                currency: 'inr',
                                product_data: {
                                    name: item.course.title,
                                    description: `Course by ${item.course.tutorName}`
                                },
                                unit_amount: Math.round(item.price * 100),
                            },
                            quantity: 1,
                        })),
                        {
                            price_data: {
                                currency: 'inr',
                                product_data: {
                                    name: 'Platform Fee',
                                    description: 'Additional charge'
                                },
                                unit_amount: Math.round(platFormfee * 100),
                            },
                            quantity: 1,
                        },
                    ],
                    mode: 'payment',
                    payment_intent_data: {},
                    metadata: {
                        orderId: order._id.toString(),
                        userId: userId
                    },
                    success_url: `${process.env.SUCCESS_PAGE_ORIGIN}?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${process.env.FAILURE_PAGE_ORIGIN}?session_id={CHECKOUT_SESSION_ID}`,
                }, { idempotencyKey });

                return session.url;

            } catch (error) {
                // Clean up the pending order if stripe session creation fails
                await this.PaymentRepository.update(order._id.toString(), {
                    paymentStatus: 'Failed',
                    gatewayStatus: false
                });
                throw new CustomError('Failed to create Stripe checkout session.', HttpStatusCode.INTERNAL_SERVER_ERROR);
            }

        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            console.error("Error in creating checkout session", error);
            throw new CustomError("Unable to create checkout session", HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
    }


    async verifySuccessPayment(sessionId: string): Promise<PaymentStat> {
        try {
            const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
                expand: ['payment_intent', 'line_items']
            });

            const orderId = session.metadata?.orderId;
            if (!orderId) {
                throw new CustomError(AuthMessages.ORDER_ID_NOT_FOUND_IN_SESSION, HttpStatusCode.BAD_REQUEST)
            }

            const paymentIntent = session.payment_intent as Stripe.PaymentIntent;

            const order = await this.PaymentRepository.update(orderId, {
                paymentStatus: 'Success',
                paymentId: paymentIntent.id.toString(),
                paymentMethod: paymentIntent.payment_method_types?.[0],
                currency: paymentIntent.currency,
                gatewayStatus: true
            })

            if (!order) {
                throw new CustomError(AuthMessages.ORDER_NOT_FOUND, HttpStatusCode.NOT_FOUND)
            }

            const cart = await this.CartRepository.findById(order.cart.toString());
            const userId = order.user;

            if (!cart) {
                throw new CustomError(AuthMessages.CART_NOT_FOUND, HttpStatusCode.NOT_FOUND)
            }

            cart.items = [];
            cart.cartTotal = 0;
            cart.cartItemCount = 0;

            await this.CartRepository.update(cart._id.toString(), cart);

            return {
                userId,
                orderId,
                paymentId: paymentIntent.id
            }

        } catch (error) {
            console.log('payment verificatoin failed');
            throw new CustomError(AuthMessages.PAYMENT_VERIFICATION_FAILED, HttpStatusCode.BAD_REQUEST)
        }
    }


    async verifyFailurePayment(sessionId: string): Promise<PaymentStat> {
        try {
            const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
                expand: ['payment_intent', 'line_items']
            });

            const orderId = session.metadata?.orderId;
            if (!orderId) {
                throw new CustomError(AuthMessages.ORDER_ID_NOT_FOUND_IN_SESSION, HttpStatusCode.BAD_REQUEST)
            }

            const order = await this.PaymentRepository.update(orderId, {
                paymentStatus: 'Failed',
                paymentMethod: session.payment_method_types?.[0],
                currency: session.currency!

            })
            return {
                paymentStatus: order?.paymentStatus
            }

        } catch (error) {
            console.log('payment verificatoin failed', error);
            throw new CustomError(AuthMessages.PAYMENT_VERIFICATION_FAILED, HttpStatusCode.BAD_REQUEST)
        }
    }

    async listUserOrder(userId: string, page: number, limit: number): Promise<{ orders: Partial<IOrder[]>; totalPagesCount: number }> {
        if (!userId) {
            throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND)
        }
        const orderData = await this.PaymentRepository.listUserOrders(userId, page, limit);
        if (!orderData) {
            throw new CustomError(AuthMessages.ORDER_NOT_FOUND, HttpStatusCode.NOT_FOUND)
        }
        return orderData;
    }

    async handleRetryPayment(userId: string, order_id: string): Promise<string | null> {
        try {
            if (!userId) {
                throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND)
            }

            if (!order_id) {
                throw new CustomError(AuthMessages.ORDER_NOT_FOUND, HttpStatusCode.NOT_FOUND)
            }

            const order = await this.PaymentRepository.findOne({ _id: order_id });
            if (!order) {
                throw new CustomError(AuthMessages.ORDER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }

            if (order.user.toString() !== userId) {
                throw new CustomError(AuthMessages.UNAUTHORIZED_ORDER, HttpStatusCode.UNAUTHORIZED);
            }

            const orderItemsWithDetails = await Promise.all(
                order.items.map(async (item: IOrderItems) => {
                    const course = await this.CourseRepository.findOne({ _id: item.course });
                    return { ...item, course }
                })
            );

            console.log(...orderItemsWithDetails)

            const lineItems = [
                ...orderItemsWithDetails.map((item: any) => ({

                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: item.course.title,
                            description: `Course by ${item.course.tutorName}`
                        },
                        unit_amount: Math.round((order.billTotal - order.platFormfee) * 100 / order.items.length)
                    },
                    quantity: 1
                })),
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: 'Platform Fee',
                            description: 'Additional charge for platform usage'
                        },
                        unit_amount: Math.round(order.platFormfee * 100)
                    },
                    quantity: 1
                }
            ];


            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                metadata: {
                    orderId: order._id.toString()
                },
                success_url: `${process.env.SUCCESS_PAGE_ORIGIN}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FAILURE_PAGE_ORIGIN}?session_id={CHECKOUT_SESSION_ID}`,
            });

            return session.url;

        } catch (error) {
            throw new CustomError(AuthMessages.FAILED_TO_FETCH_ORDER, HttpStatusCode.BAD_REQUEST)
        }
    }

    async handleWalletPayment(userId: string, paymentGateway: string): Promise<IWallet> {
        const [userCart, user, userWallet] = await Promise.all([
            this.CartRepository.findByWithCart(userId),
            this.UserRepository.findById(userId),
            this.WalletRepository.findOne({ walletOwner: userId }),
        ]);


        if (!user) throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        if (!userCart) throw new CustomError(AuthMessages.CART_IS_EMPTY, HttpStatusCode.BAD_REQUEST);
        if (!userWallet) throw new CustomError(AuthMessages.WALLET_ACTIVATION_PENDING, HttpStatusCode.NOT_FOUND);


        const walletBalance = userWallet.walletBalance;
        const totalAmount = userCart.cartTotal;
        const totalPurchaseCount = userCart.items.length;
        const transactionId = `TXN-${uuidv4().slice(0, 13)}`;

        const transaction = {
            transactionId: transactionId,
            amount: totalAmount,
            type: 'debit',
            status: 'completed',
            date: new Date()
        }


        if (walletBalance < userCart.cartTotal) {
            throw new CustomError(AuthMessages.INSUFFICIENT_BALANCE, HttpStatusCode.BAD_REQUEST)
        }

        const orderItems = userCart.items.map((item: ICartItem) => ({
            course: item.course._id
        }));

        const platFormfee = 15;
        const billTotal = userCart.cartTotal + platFormfee;

        const paymentId = `wi_${uuidv4().slice(0, 20).replace(/-/g, '')}`;

        const payment = await this.PaymentRepository.create({
            cart: userCart._id,
            user: user._id,
            items: orderItems,
            paymentId: paymentId,
            paymentGateway: paymentGateway,
            paymentMethod: 'Digital Wallet',
            paymentStatus: 'Success',
            currency: 'digital',
            platFormfee: platFormfee,
            billTotal
        });

        // If payment is created successfully, update cart and wallet

        try {
            const [updateCart, updateWallet] = await Promise.all([
                this.CartRepository.update(
                    userCart._id.toString(),
                    { items: [], cartTotal: 0, cartItemCount: 0 }
                ),
                this.WalletRepository.update(
                    userWallet._id.toString(),
                    {
                        $inc: {
                            walletBalance: -totalAmount,
                            totalPurchases: totalPurchaseCount,
                            totalSpent: totalAmount
                        },
                        $push: {
                            transactions: transaction
                        }
                    } as UpdateQuery<IWallet>
                )
            ])

            if (!updateWallet) {
                throw new CustomError(AuthMessages.WALLET_UPDATE_FAILED, HttpStatusCode.BAD_REQUEST)
            }

            console.log("updateWallet after", updateWallet)

            return updateWallet;

        } catch (error) {
            await this.PaymentRepository.update(payment._id.toString(), { paymentStatus: 'Failed' });
            throw error;
        }
    }

}
