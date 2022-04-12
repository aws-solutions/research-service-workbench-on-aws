import TransportStream, { TransportStreamOptions } from 'winston-transport';
import {
  CloudWatchLogsClient,
  CloudWatchLogsClientConfig,
  DataAlreadyAcceptedException,
  InputLogEvent,
  InvalidSequenceTokenException,
  PutLogEventsCommand
} from '@aws-sdk/client-cloudwatch-logs';
import { TextDecoder, TextEncoder } from 'util';

const MAX_BATCH_SIZE: number = 1048576; // in bytes
const MAX_MESSAGE_SIZE: number = 262144; // in bytes
const BASE_MESSAGE_SIZE: number = 26; // in bytes

/**
 * TODO's:
 * - implement sending log batch if oldest log is \>= 9 seconds old (can be configured)
 * - figure out how to properly configure credentialing
 * - warn that a message was truncated (not sure if required)
 * - figure out how to flush logs when process exits (if possible)
 * - handle errors related to sending logs to cloudwatch
 * - clean up _uploadLogs() function, especially in the try/catch block
 * - look at consoleTransport.ts to see if we can do the same thing about info[MESSAGE] instead of using any in the log function
 */

interface CloudwatchLogsTransportOptions extends TransportStreamOptions {
  region: string;
  logGroupName: string;
  logStreamName: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  oldestLogAge?: number;
}

export class CloudwatchLogsTransport extends TransportStream {
  private _cloudwatchLogsClient: CloudWatchLogsClient;
  private _logGroupName?: string;
  private _logStreamName?: string;
  private _nextSequenceToken?: string;
  private _logQueue: InputLogEvent[];
  private _batchSize: number;
  private _oldestLogAge: number;
  private _encoder: TextEncoder;
  private _decoder: TextDecoder;

  public constructor(options: CloudwatchLogsTransportOptions) {
    super(options);

    const config: CloudWatchLogsClientConfig = {
      // TODO figure out how to correctly configure
      region: process.env.AWS_REGION || options.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        sessionToken: process.env.AWS_SESSION_TOKEN
      }
    };

    this._cloudwatchLogsClient = new CloudWatchLogsClient(config);

    this._logGroupName = options.logGroupName;
    this._logStreamName = options.logStreamName;
    this._oldestLogAge = options.oldestLogAge || 9000;

    this._logQueue = [];
    this._batchSize = 0;
    this._encoder = new TextEncoder();
    this._decoder = new TextDecoder();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async log(info: any, callback: () => void): Promise<void> {
    /* send log batch if: (from https://sage.amazon.com/posts/950517)
        - batch size >= MAX_BATCH_SIZE
        - logQueue.length >= 10,000
        - oldest log is >= 9 seconds old (can be configured) TODO how to implement
        - process exits
    */

    const now = new Date().getTime();

    let message = JSON.stringify(info);
    const encodedMessage = this._encoder.encode(message);

    let messageLength = encodedMessage.length + BASE_MESSAGE_SIZE;
    if (messageLength > MAX_MESSAGE_SIZE) {
      messageLength = MAX_MESSAGE_SIZE;

      const truncatedMessage = encodedMessage.slice(0, messageLength); // TODO warn that the message was truncated?
      message = this._decoder.decode(truncatedMessage);
    }

    if (
      messageLength + this._batchSize >= MAX_BATCH_SIZE ||
      this._logQueue.length >= 10000 ||
      (this._logQueue[0]?.timestamp && now - this._logQueue[0].timestamp >= this._oldestLogAge)
    ) {
      await this._uploadLogs();
    }

    this._batchSize += messageLength;
    this._logQueue.push({
      message,
      timestamp: now
    });

    if (callback) {
      callback();
    }
  }

  private async _uploadLogs(): Promise<void> {
    try {
      const putlogsCommand = new PutLogEventsCommand({
        logEvents: this._logQueue,
        logGroupName: this._logGroupName,
        logStreamName: this._logStreamName,
        sequenceToken: this._nextSequenceToken
      });

      const { nextSequenceToken } = await this._cloudwatchLogsClient.send(putlogsCommand);
      this._nextSequenceToken = nextSequenceToken;

      this._batchSize = 0;
      this._logQueue = [];
    } catch (e) {
      if (e instanceof DataAlreadyAcceptedException || e instanceof InvalidSequenceTokenException) {
        // Have the wrong nextSequenceToken, retry with expected token
        try {
          this._nextSequenceToken = e.expectedSequenceToken;

          await this._uploadLogs(); // TODO might need a seperate function
        } catch (e) {
          console.log(e); // TODO handle error
        }
      } else {
        console.log(e); // TODO handle error
      }
    }
  }
}
