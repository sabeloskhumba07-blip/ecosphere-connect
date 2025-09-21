export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric' 
  });
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString([], { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

export const groupDataByHour = <T extends { timestamp: Date }>(data: T[]): T[][] => {
  const groups: { [key: string]: T[] } = {};
  
  data.forEach(item => {
    const hourKey = `${item.timestamp.getFullYear()}-${item.timestamp.getMonth()}-${item.timestamp.getDate()}-${item.timestamp.getHours()}`;
    if (!groups[hourKey]) {
      groups[hourKey] = [];
    }
    groups[hourKey].push(item);
  });
  
  return Object.values(groups);
};

export const groupDataByDay = <T extends { timestamp: Date }>(data: T[]): T[][] => {
  const groups: { [key: string]: T[] } = {};
  
  data.forEach(item => {
    const dayKey = `${item.timestamp.getFullYear()}-${item.timestamp.getMonth()}-${item.timestamp.getDate()}`;
    if (!groups[dayKey]) {
      groups[dayKey] = [];
    }
    groups[dayKey].push(item);
  });
  
  return Object.values(groups);
};