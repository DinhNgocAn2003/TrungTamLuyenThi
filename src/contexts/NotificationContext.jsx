import { createContext, useContext, useState } from 'react';

const NotificationContext = createContext({
  notification: null,
  showNotification: () => {},
  hideNotification: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, severity = 'info', duration = 5000) => {
    setNotification({ message, severity, duration });
    
    // Tự động ẩn thông báo sau khoảng thời gian duration
    if (duration) {
      setTimeout(hideNotification, duration);
    }
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const value = { notification, showNotification, hideNotification };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};