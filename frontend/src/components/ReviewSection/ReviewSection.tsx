import React, { useState } from "react";
import ReviewModal from "../Modals/ReviewModal";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useListCourseReviewQuery } from "../../services/userApiSlice";
import useDateFormatter from "../../hooks/useFormatDate";
import ReactStars from "react-stars";
import { FaStar } from "react-icons/fa";

export interface ReviewSectionProps {
    id?: string;
    avgRating?: number;
    reviewCount?: number;
    formattedRating: number;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ id, avgRating, reviewCount, formattedRating }) => {
    const [showReviewModal, setShowReviewModal] = useState(false);
    const { data: reviewResponse, refetch } = useListCourseReviewQuery({ id: id! });
    const reviewData = reviewResponse?.data || [];

    const { formatDate, calculateTimeSince } = useDateFormatter();
    const userInfo = useSelector((state: RootState) => state.auth.userInfo);
    const userId = userInfo?._id || "";

    // Calculate star rating breakdown
    const calculateStarBreakdown = () => {
        const starCounts = [5, 4, 3, 2, 1].map((rating) => {
            const count = reviewData.filter((review) =>
                review.ratings >= (rating - 0.5) && review.ratings < (rating + 0.5)
            ).length;

            const percentage = (count);
            const width = Math.min(100, percentage) + "%";

            let color = '';
            switch (rating) {
                case 5:
                    color = 'green';
                    break;
                case 4:
                    color = 'blue-800';
                    break;
                case 3:
                    color = 'blue-400';
                    break;
                case 2:
                    color = 'yellow-500';
                    break;
                case 1:
                    color = 'red-500';
                    break;
                default:
                    color = 'gray';
            }
            
            return {
                label: `${rating} star`,
                count,
                percentage,
                width,
                color
            };
        });

        return starCounts;
    };

    const getColor = (color: string) => {
        switch(color) {
            case 'green': return '#22C55E'; 
            case 'blue-800': return '#1D4ED8'; 
            case 'blue-400': return '#60A5FA'; 
            case 'yellow-500': return '#F59E0B'; 
            case 'red-500': return '#EF4444'; 
            default: return '#9CA3AF';
        }
    };

 



    const starBreakdown = calculateStarBreakdown();

    const openReviewModal = () => {
        setShowReviewModal(true);
    }

    const closeReviewModal = () => {
        setShowReviewModal(false)
    }

    return (
        <>
            <div className="flex flex-row md:flex-col">
                {/* Left: Review Section */}
                <div className="w-full mr-8 md:w-[1200px]">
                    <div className="flex items-center justify-start mb-4">
                        <h1 className="text-xl font-medium text-themeColor">
                            Reviews & Ratings
                        </h1>
                        <button className="px-3 py-1 ml-2 text-sm font-medium border border-gray-400 rounded-full shadow-inner text-hoverColor"
                            onClick={openReviewModal}
                        >
                            Add Review
                        </button>
                    </div>
                    <div>
                        <div className="flex items-center w-full mb-2 space-x-2">
                            <ReactStars
                                count={5}
                                size={24}
                                color2={'#EAB308'}
                                half={true}
                                value={avgRating}
                            />
                            <h1 className="mt-1 text-base text-gray-500">{formattedRating} <span>Average Ratings</span></h1>
                        </div>
                        <p className="mt-2 font-medium text-gray-500">
                            {reviewCount} Total ratings
                        </p>
                        {/* Star rating breakdown */}
                        {starBreakdown.map((item, i) => (
                            <div className="flex w-full max-w-full mt-4" key={i}>
                                <a href={`#${item.label}`} className="text-sm font-medium text-themeColor hover:underline">
                                    {item.label}
                                </a>
                                <div className="w-[600px] h-3 mx-4 bg-gray-200 rounded-full">
                                    <div
                                        className={`w-full h-3 text-${item.color} rounded-full`}
                                        style={{ width: item.width, backgroundColor: getColor(item.color) }}
                                    ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {item.percentage}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-12">
                    {reviewData?.map((review) => (
                        <div key={review._id} className="flex flex-col mb-4">
                            <div className="flex">
                                <img className="object-cover w-10 h-10 border-2 rounded-full me-4 border-hoverColor" src={review.user.profileImage || '/profile.webp'} alt="profile" />
                                <div className="font-medium ">
                                    <p className="text-themeColor">{review.user.username} <time dateTime="2014-08-16 19:00" className="block text-sm text-gray-400 ">Updated on {formatDate(review?.createdAt)}</time></p>
                                </div>
                            </div>
                            <div className="flex flex-col mt-2 break-words w-full md:w-[1200px]">
                                <h1 className="flex items-center gap-2 font-medium text-gray-600">{review.title}
                                    <span className="flex items-center text-sm">
                                        {review.ratings}
                                        <FaStar style={{ color: '#EAB308' }} />
                                    </span>
                                </h1>
                                <p className="mb-2 text-gray-500 ">{review.feedback}. <span className="text-sm text-gray-700">{calculateTimeSince(review.createdAt)}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {showReviewModal && (
                <ReviewModal onclose={closeReviewModal} courseId={id} userId={userId} refetch={refetch} />
            )}
        </>
    );
};

export default ReviewSection;