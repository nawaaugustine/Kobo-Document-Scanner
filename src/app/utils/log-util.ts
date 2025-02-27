export class LogUtil {
    private static readonly MAX_LOG_SIZE = 4000;
  
    /**
     * Logs a long message in chunks to avoid logcat truncation.
     * @param message The complete string to log.
     * @param tag Optional tag to prefix each log line. Defaults to 'LOG'.
     */
    static logLongMessage(message: string, tag: string = 'LOG'): void {
      if (!message) {
        return;
      }
  
      const messageLength = message.length;
      for (let i = 0; i < messageLength; i += LogUtil.MAX_LOG_SIZE) {
        const chunk = message.substring(i, Math.min(i + LogUtil.MAX_LOG_SIZE, messageLength));
        console.log(`${tag}: ${chunk}`);
      }
    }
  }
  