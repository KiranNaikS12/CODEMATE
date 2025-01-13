const useDateFormatter = () => {
    //Aug 05
    const formatDate = (dateString: string | undefined, formatOptions?: Intl.DateTimeFormatOptions): string => {
      if (!dateString) return '';
  
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = formatOptions || { month: 'short', day: '2-digit' };
      return new Intl.DateTimeFormat('en-US', options).format(date);
    };
  
    //3 days ago
    const calculateTimeSince = (dateString: string | undefined): string => {
      if (!dateString) return '';
  
      const now = new Date();
      const pastDate = new Date(dateString);
      const diffInSeconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);
  
      if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  
      const daysAgo = Math.floor(diffInSeconds / 86400);
      return daysAgo === 1 ? `Yesterday` : `${daysAgo} days ago`;
    };
  
    //2024-10-10
    const formatToISODate = (dateString: string | undefined): string => {
      if (!dateString) return '';
      return new Date(dateString).toISOString().split('T')[0];
    };
  
    return {
      formatDate,
      calculateTimeSince,
      formatToISODate,
    };
  };
  
  export default useDateFormatter;
  