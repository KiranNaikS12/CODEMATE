import React from 'react'

interface Button {
   buttonText:string,
   className?:string
   onClick?: ()=> void;
}

const CommonButton: React.FC<Button> = ({buttonText, className, onClick}) => {
  return (
    <button className={`${className}`} onClick={onClick}>
        {buttonText}
    </button>
  )
}

export default React.memo(CommonButton)
