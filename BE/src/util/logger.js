const fs = require('fs');
const path = require('path');

// Buat directory logs jika tidak ada
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'booking-reservations.log');

// Format timestamp
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString();
};

// Format log message
const formatLog = (level, message, data = null) => {
  const timestamp = getTimestamp();
  let logMessage = `[${timestamp}] [${level}] ${message}`;
  if (data) {
    logMessage += '\n' + JSON.stringify(data, null, 2);
  }
  return logMessage;
};

// Write to file and console
const log = (level, message, data = null) => {
  const logMessage = formatLog(level, message, data);
  
  // Console output
  if (level === 'ERROR') {
    console.error(logMessage);
  } else if (level === 'WARN') {
    console.warn(logMessage);
  } else {
    console.log(logMessage);
  }
  
  // File output
  try {
    fs.appendFileSync(logFile, logMessage + '\n\n');
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
};

module.exports = {
  info: (message, data) => log('INFO', message, data),
  warn: (message, data) => log('WARN', message, data),
  error: (message, data) => log('ERROR', message, data),
  booking: (message, data) => log('BOOKING', message, data),
  getLogFile: () => logFile
};
