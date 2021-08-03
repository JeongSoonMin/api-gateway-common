const zlib = require('zlib');
const AWS = require('aws-sdk');
const firehose = new AWS.Firehose();

function transformLogEvent(logEvent) {
  let logData = logEvent.extractedFields.event;

  try {
    const parseJson = JSON.parse(logData);
  } catch(e) {
    // lambda 의도치 않은 오류일 때만 service: lambda 로 지정하여, 넘기고 이외의 로그는 제외 한다.
    if (logEvent.extractedFields != undefined && logEvent.extractedFields.log_level != undefined
        && logEvent.extractedFields.log_level != "" && logEvent.extractedFields.log_level == "ERROR") {
      logData = {
        "timestamp": new Date(logEvent.timestamp).toISOString(),
        "service": "lambda",
        "level": "ERROR",
        "message": ""
      };
      logData['message'] = logEvent.extractedFields.event;
      logData = JSON.stringify(logData);
    } else {
      console.log("규격화된 로그가 아닙니다.\nLOG : " + JSON.stringify(logEvent));
      return Promise.resolve(null);
    }
  }

  return Promise.resolve({ "Data": Buffer.from(logData) });
}


exports.handler = (event, context, callback) => {
  const buffer = Buffer.from(event.awslogs.data, 'base64');
  let decompressed;
  try {
    decompressed = zlib.gunzipSync(buffer);
  } catch (e) {
    console.log("error:" + e);
  }

  const data = JSON.parse(decompressed);

  if (data.messageType === 'DATA_MESSAGE') {
    const promises = data.logEvents.map(transformLogEvent);
    Promise.all(promises)
    .then(recs => {
      // 비정규화된 일반 로그 제외. 비정규화된 로그는 transformLogEvent 펑션에서 null 처리 한다.
      recs = recs.filter(rec => rec != null);

      if (recs == undefined || recs.length == 0) {
        console.log("정상 로그 등록 대상 데이터가 없습니다.\ndata : " + JSON.stringify(data));
        return;
      }

      let loggingParams = {
        DeliveryStreamName: process.env.LOGGING_STREAM_NAME, // firehose stream 명. 환경변수로 지정.
        Records: recs
      };

      firehose.putRecordBatch(loggingParams, (err, data) => {
        if (err) {
          console.log(err);
          return Promise.reject(err);
        }
        return Promise.resolve(data);
      });
    });
  }
};
