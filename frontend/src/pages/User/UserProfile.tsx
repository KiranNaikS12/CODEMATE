import React, { useState } from "react";
import Header from "../../components/Headers/Header";
import {
  Camera,
  ExternalLink,
  Heart,
  History,
  Lock,
  Settings,
  ShoppingCart,
  User,
  Wallet2,
} from "lucide-react";
import { FaBars } from "react-icons/fa";
import {
  useGetUserByIdQuery,
} from "../../services/userApiSlice";
import UploadImageModal from "../../components/Modals/UploadImageModal";
import {  useParams } from "react-router-dom";
import AdditionalInfo from "../../components/ProfileContent/AdditionalInfo";
import AccountInfo from "../../components/ProfileContent/AccountInfo";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PaymentHistory from "../../components/ProfileContent/PaymentHistory";
import WalletInfo from "../../components/ProfileContent/WalletInfo";
import UserNotFound from "../CommonPages/UserNotFound";
import { ErrorData } from "../../types/types";


const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Account')
  const  { data: userData, isError, error, refetch} = useGetUserByIdQuery(id || "", {
    skip: !id,
  });
  
  console.log('error', error)


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }


  const handleProfileModule = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  const handleTabClick = (tabName:string) => {
    setSelectedTab(tabName)
  }

  if(isError || error) {
     return (
      <UserNotFound errorData= {error as ErrorData}/>
     )
  }

  //rendering the content dynamically
  const renderContent = () => {
    switch(selectedTab){
      case 'Account':
        return(
          <AccountInfo userId={id} userData={userData?.data}/>
        );
      case 'Basic Info':
        return (
          <AdditionalInfo userId={id} userData={userData?.data} refetch={refetch}/>
        );
      case 'Wallet':
        return (
          <WalletInfo userId = {id}/>
        );
      case 'Order History':
        return (
          <PaymentHistory userId={id}/>
        )
      case 'Privacy Policy':
        return <div></div>
    }
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-200">
      <Header />
      <div className="flex flex-col h-full gap-8 pr-4 mt-8 md:flex-row md:pl-12 lg:pl-36 md:pr-28">
        <div className="flex flex-col items-center w-full ml-2 bg-white rounded-lg shadow-lg md:w-1/4 md:mb-10 md:ml-0  md:h-[calc(100vh-190px)] overflow-y-auto">
          <div className="w-full bg-themeColor h-[100px] rounded-t-lg"></div>

          <div className="relative w-24 h-24 overflow-hidden border-4 rounded-full -top-14 border-customGrey md:h-20 md:w-20 lg:w-32 lg:h-40">
            <img
              src={userData?.data.profileImage
                 ||"/profile.webp"}
              alt="profile"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 bg-black bg-opacity-50 opacity-0 hover:opacity-100" onClick={() => handleProfileModule()}>
              <Camera size={24} className="text-white" />
              <span className="ml-2 text-sm text-white">Edit</span>
            </div>
          </div>

          <div className="flex flex-col items-center -mt-10 text-gray-500">
            <h1 className="font-semibold">{userData?.data.username}</h1>
            <h1 className="font-semibold">{userData?.data.email}</h1>
          </div>

          <button
            className="pb-2 mt-3 text-gray-600 md:hidden"
            onClick={toggleMenu}
          >
            <FaBars size={24} />
          </button>

          <div
            className={`${
              isMenuOpen ? "flex" : "hidden"
            } md:flex flex-col items-start pb-8 mt-4 md:mt-12 space-y-6 text-sm text-gray-600 w-full pl-6`}
          >
            <div className="flex items-center gap-x-2" onClick={() => handleTabClick('Account')}>
              {selectedTab === 'Account' && (
                <motion.div 
                   className="w-1 rounded-lg h-[30px] bg-hoverColor"
                   initial={{height: 0, opacity: 0, backgroundColor: '#E0F7FA'}}
                   animate={{height: '30px', opacity: 1, backgroundColor: '#0288D1'}}
                   exit={{height: 0, opacity: 0}}
                   transition={{
                    height: { duration: 0.4, ease: 'easeInOut' }, 
                    backgroundColor: { duration: 0.6, ease: 'easeInOut' } 
                  }}
                   > 
                </motion.div>
              )}
              <motion.div className="flex gap-x-2"
                whileHover={{scale:1.1, }}
              >
                <Settings size={20} />
                <button className="transition-colors duration-300 hover:text-themeColor">
                  <h1 className="text-sm">Account</h1>
                </button>
              </motion.div>
            </div>

            <div className="flex items-center gap-x-2" onClick={() => handleTabClick('Basic Info')}>
              {selectedTab === 'Basic Info' && (
                <motion.div 
                   className="w-1 rounded-lg h-[30px] bg-hoverColor"
                   initial={{height: 0, opacity: 0, backgroundColor: '#E0F7FA'}}
                   animate={{height: '30px', opacity: 1, backgroundColor: '#0288D1'}}
                   exit={{height: 0, opacity: 0}}
                   transition={{
                    height: { duration: 0.4, ease: 'easeInOut' }, 
                    backgroundColor: { duration: 0.6, ease: 'easeInOut' } 
                  }}
                   > 
                </motion.div>
              )}
              <motion.div className="flex gap-x-2"
                whileHover={{scale:1.1, }}
              >
                <User size={20} />
                <button className="transition-colors duration-300 hover:text-themeColor">
                  <h1 className="text-sm">Basic Info</h1>
                </button>
              </motion.div>
            </div>

            <div className="flex items-center gap-x-2" onClick={() => handleTabClick('Wallet')}>
              {selectedTab === 'Wallet' && (
                <motion.div 
                   className="w-1 rounded-lg h-[30px] bg-hoverColor"
                   initial={{height: 0, opacity: 0, backgroundColor: '#E0F7FA'}}
                   animate={{height: '30px', opacity: 1, backgroundColor: '#0288D1'}}
                   exit={{height: 0, opacity: 0}}
                   transition={{
                    height: { duration: 0.4, ease: 'easeInOut' }, 
                    backgroundColor: { duration: 0.6, ease: 'easeInOut' } 
                  }}
                   > 
                </motion.div>
              )}
              <motion.div className="flex gap-x-2"
                whileHover={{scale:1.1, }}
              >
                <Wallet2 size={20} />
                <button className="transition-colors duration-300 hover:text-themeColor">
                  <h1 className="text-sm">Wallet</h1>
                </button>
              </motion.div>
            </div>

            <div className="flex items-center gap-x-2" onClick={() => handleTabClick('Favourite')}>
              {selectedTab === 'Favourite' && (
                <motion.div 
                   className="w-1 rounded-lg h-[30px] bg-hoverColor"
                   initial={{height: 0, opacity: 0, backgroundColor: '#E0F7FA'}}
                   animate={{height: '30px', opacity: 1, backgroundColor: '#0288D1'}}
                   exit={{height: 0, opacity: 0}}
                   transition={{
                    height: { duration: 0.4, ease: 'easeInOut' }, 
                    backgroundColor: { duration: 0.6, ease: 'easeInOut' } 
                  }}
                   > 
                </motion.div>
              )}
              <motion.div className="flex gap-x-2"
                whileHover={{scale:1.1, }}
              >
                <Heart size={20} />
                <Link to={`/wishlist/${id}`}>
                  <button className="flex items-center transition-colors duration-300 hover:text-themeColor gap-x-2">
                      <h1 className="text-sm">Favourite</h1>
                      <ExternalLink size={16} color="#3B82F6"/>
                  </button>
                </Link>
              </motion.div>
            </div>

            <div className="flex items-center gap-x-2" onClick={() => handleTabClick('Cart')}>
              {selectedTab === 'Cart' && (
                <motion.div 
                   className="w-1 rounded-lg h-[30px] bg-hoverColor"
                   initial={{height: 0, opacity: 0, backgroundColor: '#E0F7FA'}}
                   animate={{height: '30px', opacity: 1, backgroundColor: '#0288D1'}}
                   exit={{height: 0, opacity: 0}}
                   transition={{
                    height: { duration: 0.4, ease: 'easeInOut' }, 
                    backgroundColor: { duration: 0.6, ease: 'easeInOut' } 
                  }}
                   > 
                </motion.div> 
              )}
              <motion.div className="flex gap-x-2"
                whileHover={{scale:1.1, }}
              >
                <ShoppingCart size={20} />
                <Link to = {`/cart/${id}`}>
                  <button className="flex items-center transition-colors duration-300 hover:text-themeColor gap-x-2">
                    <h1 className="text-sm">Cart</h1>
                    <ExternalLink size={16} color="#3B82F6"/>
                  </button>
                </Link>
              </motion.div>
            </div>

            <div className="flex items-center gap-x-2" onClick={() => handleTabClick('Order History')}>
              {selectedTab === 'Order History' && (
                <motion.div 
                   className="w-1 rounded-lg h-[30px] bg-hoverColor"
                   initial={{height: 0, opacity: 0, backgroundColor: '#E0F7FA'}}
                   animate={{height: '30px', opacity: 1, backgroundColor: '#0288D1'}}
                   exit={{height: 0, opacity: 0}}
                   transition={{
                    height: { duration: 0.4, ease: 'easeInOut' }, 
                    backgroundColor: { duration: 0.6, ease: 'easeInOut' } 
                  }}
                   > 
                </motion.div>
              )}
              <motion.div className="flex gap-x-2"
                whileHover={{scale:1.1, }}
              >
                <History size={20} />
                <button className="transition-colors duration-300 hover:text-themeColor">
                  <h1 className="text-sm">Order History</h1>
                </button>
              </motion.div>
            </div>
            
            <div className="flex items-center gap-x-2" onClick={() => handleTabClick('Privacy Policy')}>
              {selectedTab === 'Privacy Policy' && (
                <motion.div 
                   className="w-1 rounded-lg h-[30px] bg-hoverColor"
                   initial={{height: 0, opacity: 0, backgroundColor: '#E0F7FA'}}
                   animate={{height: '30px', opacity: 1, backgroundColor: '#0288D1'}}
                   exit={{height: 0, opacity: 0}}
                   transition={{
                    height: { duration: 0.4, ease: 'easeInOut' }, 
                    backgroundColor: { duration: 0.6, ease: 'easeInOut' } 
                  }}
                   > 
                </motion.div>
              )}
              <motion.div className="flex gap-x-2"
                whileHover={{scale:1.1, }}
              >
                <Lock size={20} />
                <button className="transition-colors duration-300 hover:text-themeColor">
                  <h1 className="text-sm">Privacy Policy</h1>
                </button>
              </motion.div>
            </div>
            
          </div>
        </div>
          {renderContent()}
        {isProfileOpen && id && (
           <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
           <UploadImageModal handleProfile = {handleProfileModule} userId={id} refetch={refetch} roleId='user'/>    
         </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
