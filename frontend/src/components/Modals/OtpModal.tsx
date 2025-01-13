import React, { useEffect, useState } from 'react';


interface OTPModalProps {
  onSubmit: (otp: string) => void;
  onClose: () => void;
  onResend: () => void;
}

const OtpModal: React.FC<OTPModalProps> = ({ onSubmit, onClose, onResend }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countDown, setCountDown] = useState(60); 
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountDown((prevCountDown) => {
        if (prevCountDown > 0) {
          return prevCountDown - 1;
        } else {
          clearInterval(timer);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countDown]);

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Focus the next input
      if (value !== '' && index < 5) {
        (document.getElementById(`otp-${index + 1}`) as HTMLInputElement)?.focus();
      }
    }
  };

  const handleSubmit = () => {
    onSubmit(otp.join(''));
  };

  const handleOnResend = async () => {
    setIsResending(true);
    await onResend();
    setCountDown(60);
    setIsResending(false);
    setOtp(['', '', '', '', '', '']);
  };

  const isOtpComplete = otp.every((digit) => digit !== '');
  const isVerifyDisabled = countDown === 0 || !isOtpComplete;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-600 bg-opacity-50">
      <div className="p-6 bg-white rounded-lg shadow-xl md:p-12 md:max-w-lg md:w-full">
        <h2 className="mb-6 text-3xl font-bold text-center md:text-left">Enter OTP!</h2>
        <p className="mb-6 text-lg text-center md:text-left">Enter the OTP sent to your email</p>
        <div className="flex justify-between mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-10 h-10 text-3xl text-center border border-gray-400 rounded-lg shadow-md md:h-16 md:w-16"
              required
            />
          ))}
        </div>
        <button
          onClick={handleSubmit}
          className={`w-full py-2 md:py-3 text-white rounded-md ${
            isVerifyDisabled
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-themeColor hover:bg-themeColorDark'
          }`}
          disabled={isVerifyDisabled}
        >
          {countDown === 0 ? 'OTP Expired' : 'Verify OTP'}
        </button>
        <div className='flex items-center justify-between mt-2 md:mt-4'>
          <button onClick={onClose} className="text-sm text-gray-600">
            Cancel
          </button>
          <button
            className={`text-themeColor ${
              countDown > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:text-themeColorDark'
            }`}
            onClick={handleOnResend}
            disabled={countDown > 0 || isResending}
          >
            {isResending ? 'Resending...' : 'Resend OTP'}
          </button>
        </div>
        <div className='flex justify-center mt-4'>
          <p>
            {countDown > 0
              ? `Time remaining: 00:${countDown.toString()} seconds`
              : 'OTP has expired. Please resend.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;