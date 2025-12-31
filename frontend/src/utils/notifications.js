// Notification utility with sound

// Request notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

// Play notification sound
const playNotificationSound = () => {
  try {
    // Create a simple notification sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

// Show notification with sound
export const showNotification = (title, options = {}) => {
  // Play sound
  playNotificationSound();

  // Show browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });

    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);

    return notification;
  }
};

// Notification for new message
export const notifyNewMessage = (senderName, message, isPrivate = false) => {
  const title = isPrivate 
    ? `New message from ${senderName}` 
    : `${senderName} in Community Chat`;
  
  showNotification(title, {
    body: message.length > 100 ? message.substring(0, 100) + '...' : message,
    tag: 'message-notification',
    requireInteraction: false
  });
};

// Notification for new task assignment
export const notifyNewTask = (assignerName, taskTitle) => {
  showNotification(`New Task Assigned`, {
    body: `${assignerName} assigned you: ${taskTitle}`,
    tag: 'task-notification',
    requireInteraction: false
  });
};

// Initialize notifications on app load
export const initNotifications = () => {
  requestNotificationPermission();
};
