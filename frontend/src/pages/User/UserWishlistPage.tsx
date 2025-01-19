import React, { useEffect } from "react"
import Header from "../../components/Headers/Header"
import { ShoppingCart, Trash2 } from "lucide-react"
import { FaStar } from "react-icons/fa"
import { useParams } from "react-router-dom"
import { useListWishlistItemsQuery, useRemoveWishlistItemsMutation } from "../../services/userApiSlice"
import usePriceCalculations from "../../hooks/usePriceCalculation"
import { APIError, ErrorData } from "../../types/types";
import { toast } from 'sonner';
import Swal from "sweetalert2";
import { Link } from "react-router-dom"
import UserNotFound from "../CommonPages/UserNotFound"

const UserWishlistPage:React.FC = () => {
    const { id } = useParams<{id: string}>();
    const { data: wishlistResponse, isError, error, refetch } = useListWishlistItemsQuery({userId: id!}, {skip: !id})
    const wishlistDetails = wishlistResponse?.data;
    const { formatPrice, calculateDiscountPrice } = usePriceCalculations();
    const [removeItem] =  useRemoveWishlistItemsMutation();

    useEffect(() => {
        if(id) {
            refetch()
        }
    },[id, refetch])

    const handleRemove = async (userId: string, itemId: string) => {
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
                refetch();
            }
        } catch (error) {
            const apiError = error as APIError;
            if(apiError.data && apiError.data.message) {
                toast.error(apiError.data.message)
            }
        } 
    }

    if(isError || error) {
        return (
            <UserNotFound errorData={error as ErrorData}/>
        )
    }
    
     return (
        <div className="flex flex-col w-full min-h-screen bg-gray-200">
            <Header/>
            <div className='flex items-end justify-center mt-4 gap-x-1'>
                <h1 className="text-2xl font-medium bg-gray-200 text-themeColor">MY WISHLIST</h1>
                <h1 className='text-md text-highlightBlue'>
                    {wishlistDetails?.totalItemCount || 0 } {wishlistDetails?.totalItemCount === 1 ? 'item' : 'items'} listed has favourite
                </h1>
            </div>
            {wishlistDetails && wishlistDetails?.totalItemCount <= 0  ? (
                <>
                <div className="relative flex flex-col items-center mt-20 justify-evenly">
                    <img
                        src="/not_found.png"
                        alt="not_found"
                        className="w-96 h-w-96"
                    />
                    <div>
                        <Link to ='/course'>
                            <button className="px-3 py-2 rounded-lg shadow-inner bg-themeColor text-customGrey">ADD TO WISHLIST</button>
                        </Link>
                    </div>
                </div>
                
                </>
            ) : ( 
                <div className="flex justify-center mt-6">
                <div className="w-[1100px] h-[260px] rounded-lg">
                    {wishlistDetails?.items.map((item) => (
                    <div key={item._id} className="flex w-full p-1 py-2 mb-2 overflow-hidden bg-white rounded-lg">
                        <div className="flex p-2 gap-x-5">
                            <div className="">
                                <img src={item.course.coverImage}  alt={item.course.title} className="rounded-lg shadow-xl h-36 w-80"/>
                            </div> 
                        </div>
                        <div className="flex flex-col w-full">
                            <div className="flex items-center justify-between w-full mt-2">
                                <div className="flex gap-x-1">
                                    <h1 className="flex justify-center px-3 text-sm bg-gray-300 border rounded-full text-themeColor">{item.course.language}</h1>
                                    <h1 className="flex justify-center px-3 text-sm bg-gray-300 border rounded-full text-themeColor">{item.course.subject}</h1>
                                    <h1 className="flex justify-center px-3 text-sm bg-gray-300 border rounded-full text-themeColor">{item.course.category}</h1>
                                </div> 
                                <div className='flex ml-auto gap-x-2'>
                                    <button className="flex items-center text-sm text-hoverColor">
                                        <ShoppingCart/>
                                        Add To Cart
                                    </button>
                                    <div className="w-px h-6 bg-gray-300"></div>
                                    <button className='flex items-center mr-2 text-sm text-red-500'
                                        onClick={() => handleRemove(id!,item._id)}
                                    >
                                        <Trash2 size={14}/>
                                        Remove
                                    </button>
                                </div>   
                            </div>
                            <h1 className="mt-2 text-xl font-medium text-themeColor">{item.course.title}</h1>
                            <h1 className="'text-xs font-extralight  text-highlightBlue">Mentor: {item.course.tutorName}</h1>
                            <h1 className="flex items-center text-sm text-gray-600">
                                Ratings: <span className="ml-1 text-gray-400"> 4.5</span><FaStar style={{color:'yellow'}}/>
                            </h1>
                            <h1 className="mt-4 "><span className="text-gray-400 line-through">{formatPrice(item.course.price)}</span>
                                <span className="ml-1">
                                    {formatPrice(calculateDiscountPrice(item.course.price, item.course.discount))}
                                </span>
                                <span className="ml-2 text-green-500">
                                    { item.course.discount}% off available
                                </span>
                            </h1>
                        </div>
                    </div>
                    ))}
                </div>   
            </div>
            )}
        </div>
     )
}
export default UserWishlistPage