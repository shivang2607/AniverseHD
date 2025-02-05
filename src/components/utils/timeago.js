// utils/timeago.js
import TimeAgo from 'javascript-time-ago'
import ReactTimeAgo from 'react-time-ago'
import en from 'javascript-time-ago/locale/en'

// Use try-catch to prevent multiple initializations
try {
  TimeAgo.addDefaultLocale(en)
} catch (e) {
  // Locale already added, ignore the error
}

// Custom component with default locale
export function CustomTimeAgo({ date, ...props }) {
  return <ReactTimeAgo date={date} locale="en-US" {...props} />
}

// Export the original ReactTimeAgo if needed
export { ReactTimeAgo }