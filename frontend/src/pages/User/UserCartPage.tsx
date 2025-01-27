import React, { useEffect} from 'react'
import Header from '../../components/Headers/Header'
import { FaStar } from 'react-icons/fa'
import { Trash2 } from 'lucide-react'
import { useListCartItemsQuery, useRemoveCartItemsMutation } from '../../services/userApiSlice'
import { useParams } from 'react-router-dom'
import usePriceCalculations from '../../hooks/usePriceCalculation'
import { APIError, ErrorData } from '../../types/types';
import { toast, Toaster } from 'sonner';
import Swal from "sweetalert2";
import { Link } from 'react-router-dom'
import UserNotFound from '../CommonPages/UserNotFound'

const UserCartPage:React.FC = () => {
  const {id} = useParams<{ id: string}>();
  const { data: cartResponse, isError, error,  refetch } = useListCartItemsQuery({userId: id!} , { skip: !id});
  const cartDetails = cartResponse?.data;
  const { calculateDiscountPrice, formatPrice } = usePriceCalculations();
  const [removeItem] = useRemoveCartItemsMutation()

  console.log(cartDetails?.items)
  
  useEffect(() =>  {
    if(id) {
        refetch()
    }
  },[id, refetch])
  
  //handleRemoveItemsFromCart
  const handleRemoveCart = async(userId:string, itemId: string ) => {
    try {
         const response = await removeItem({userId, itemId}).unwrap();
         if(response) {
            Swal.fire({
                title: "Removed!",
                text: "The item has been removed from your cart.",
                icon: "success",
                confirmButtonText: "OK",
                timer: 2000, 
            });
        }
        
      } catch (error) {
        const apiError = error as APIError;
        if (apiError.data && apiError.data.message) {
          toast.error(apiError.data.message);
        } 
      } 
  }

  if(isError || error) {
     return (
        <UserNotFound  errorData={error as ErrorData}/>
     )
  }
   
  return (
    <>
    <Toaster
        position="bottom-center"
        richColors
      />
    <div className='flex flex-col w-full min-h-screen bg-gray-200'>
        <Header/>
        <div className='flex items-end ml-36 gap-x-1'>
            <h1 className="text-2xl font-medium bg-gray-200 text-themeColor">MY CART</h1>
            <h1 className='text-md text-highlightBlue'>
                {cartDetails?.cartItemCount || 0} { cartDetails?.cartItemCount === 1 ? 'item' : 'items'} in your cart
            </h1>
        </div>
        {cartDetails && cartDetails.cartItemCount <= 0 ? (
            <>
                <div className="relative flex flex-col items-center mt-20 justify-evenly">
                    <img
                        src="/not_found.png"
                        alt="not_found"
                        className="w-96 h-w-96"
                    />
                    <div>
                        <Link to ='/course'>
                            <button className="px-3 py-2 rounded-lg shadow-inner bg-themeColor text-customGrey">ADD COURSE</button>
                        </Link>
                    </div>
                </div>
            </>
        ) : (
            <div className='flex flex-col items-start justify-center pt-2 pl-4 pr-4 mt-2 sm:flex-row lg:pr-36 lg:pl-36 gap-x-4 gap-y-4'>
                <div className='flex flex-col w-full gap-4 mb-4 basis-3/4'>
                    {cartDetails?.items?.map((item) => (     
                    <div key={item._id} className='flex w-full p-2 overflow-hidden bg-white rounded-lg'>
                        <div className='flex p-2 gap-x-5'>
                            <div className="">
                                <img src= {item.course.coverImage} alt={item.course.title} className="w-64 rounded-lg shadow-xl h-36"/>
                            </div> 
                        </div>
                        <div className='flex flex-col w-full'>
                            <div className='flex items-center justify-between w-full mt-2'>
                                <div className='flex gap-x-1'>
                                    <h1 className='flex justify-center px-3 text-sm bg-gray-300 border rounded-full text-themeColor'>{item.course.language}</h1>
                                    <h1 className='flex justify-center px-3 text-sm bg-gray-300 border rounded-full text-themeColor'>{item.course.subject}</h1> 
                                    <h1 className='flex justify-center text-sm bg-gray-300 border rounded-full p x-3 text-themeColor'>{item.course.category}</h1>         
                                </div>
                                <div className='ml-auto'>
                                    <button className='flex items-center mr-2 text-sm text-red-500'
                                        onClick={() =>  handleRemoveCart(id!, item._id)}
                                    > 
                                        <Trash2 size={14}/>
                                        Remove
                                    </button>
                                </div>
                            </div>
                            <h1 className='mt-2 text-xl font-medium text-themeColor'>{item.course.title}</h1>
                            <h1 className='text-sm text-highlightBlue'>Mentor: {item.course.tutorName}</h1>
                            <h1 className='flex items-center text-sm text-gray-600'>
                                Ratings: <span className='ml-1 text-gray-400'> 4.5</span><FaStar style={{color:'yellow'}}/>
                            </h1>
                            <h1 className='mt-4'><span className='text-gray-400 line-through'>₹{item.course.price}</span> <span className='ml-1'> {formatPrice(calculateDiscountPrice(item.course.price, item.course.discount))}</span> <span className='text-sm text-green-500'> {item.course.discount}% Off available</span></h1>
                        </div>
                    </div>
                    ))}
                </div>
                <div className='rounded-lg bg-customGrey sm:w-[400px] w-full space-y-3'>
                    <div className='p-4 rounded-md bg-themeColor'>
                        <h1 className='text-xl text-center text-customGrey'>Cart Details</h1>
                        <div className='flex items-center justify-between w-full mt-4 text-gray-400'>
                            <h1>Total Items: {cartDetails?.cartItemCount || 0}</h1>
                            <h1>{formatPrice(cartDetails?.cartTotal  || 0)}</h1>
                        </div>
                        <div className='flex justify-between mt-4 text-customGrey'>
                            <h1 className='text-base'>Total Cost:</h1>
                            <h1 className='text-lg'>{formatPrice(cartDetails?.cartTotal || 0)}</h1>
                        </div>
                        <div className='mt-4'>
                            <Link to={`/checkout/${id}`}>
                                <button className='w-full px-4 py-2 text-black bg-green-400 rounded-md'>
                                    CHECKOUT
                                </button>
                            </Link>
                        </div>
                    </div>
                    {/* <div className='p-4 rounded-md bg-themeColor'>
                        <h1 className='mb-2 text-customGrey'>Promo Code</h1>
                        <form>
                            <div className='flex items-center gap-2'>
                                <input
                                    type='text'
                                    placeholder='Enter Promo Code'
                                    className='w-full p-2 border border-gray-300 rounded-md placeholder:text-gray-400'
                                />
                                <button
                                    type='submit'
                                    className='px-4 py-2 text-black bg-red-400 rounded-md hover:bg-red-500'
                                >
                                    APPLY
                                </button>
                            </div>
                        </form>
                    </div> */}
                </div>
            </div>
           )}
        </div>
    </>
    )
}

export default UserCartPage
