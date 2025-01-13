import { useEffect, useRef, useState } from 'react'

const useThrottle = (value: string, delay: number) => {
    const [ throttledValue, setThrottledValue] = useState(value);
    const lastExecuted = useRef(Date.now());

    useEffect(() => {
        const handler = setTimeout(() => {
            setThrottledValue(value);
            lastExecuted.current = Date.now()
        }, delay)

        return () => {
            clearTimeout(handler)
        };
    }, [value, delay]);

    return throttledValue;
}

export default useThrottle
