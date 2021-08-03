'use strict';

const jwt = require("jsonwebtoken");

module.exports.authCheck = async (event, context, callback) => {
    let contextData = {};

    if (event.headers == undefined) {
        console.error("header 정보가 없습니다.");

        callback("Unauthorized");
    }

    const headers = event.headers;

    // app 에서 요청일 경우 필수 헤더값 없을 경우 unauthorize 리턴
    if (headers['appname'] !== undefined &&
        headers['appversion'] !== undefined &&
        headers['osname'] !== undefined &&
        headers['osversion'] !== undefined) {

        contextData['appName'] = headers['appname'];
        contextData['appVersion'] = headers['appversion'];
        contextData['osName'] = headers['osname'];
        contextData['osVersion'] = headers['osversion'];
    } else if (headers['appName'] !== undefined &&
        headers['appVersion'] !== undefined &&
        headers['osName'] !== undefined &&
        headers['osVersion'] !== undefined) {

        contextData['appName'] = headers['appName'];
        contextData['appVersion'] = headers['appVersion'];
        contextData['osName'] = headers['osName'];
        contextData['osVersion'] = headers['osVersion'];
    } else {
        console.warn("App 에서 호출 되었으나 필수 헤더 값이 없습니다. Unauthorized.");
        console.debug("[request headers] : " + JSON.stringify(headers));

        callback("Unauthorized");
    }

    if (headers['authorization'] === undefined) {
        console.error("Authorization is empty.");
        console.debug("[request headers] : " + JSON.stringify(headers));

        callback("Unauthorized");
    }

    const authorization = headers['authorization'].replace("Bearer ", "");

    try {
        const secret = Buffer.from(process.env.JWT_SECRET, "base64");

        const decoded = jwt.verify(authorization, secret);

        contextData['token'] = authorization;
        contextData['userSeq'] = decoded.userSeq;
        contextData['userType'] = decoded.userType;
        contextData['nickName'] = decoded.nickName;
        contextData['deviceOs'] = decoded.deviceOs;
    } catch(err) {
        console.error("Authorization parsing error : " + err);
        console.debug("[request headers] : " + JSON.stringify(headers));

        callback("Unauthorized");
    }

    contextData['clientIp'] = event.headers['X-Forwarded-For'].split(",")[0];

    callback(null, generateAllow('USER', event.methodArn, contextData));
};

const generatePolicy = function(principalId, effect, resource, contextData) {
    // Required output:
    let authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        let policyDocument = {};
        policyDocument.Version = '2012-10-17'; // default version
        policyDocument.Statement = [];
        let statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; // default action
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    authResponse.context = contextData;
    return authResponse;
}

const generateAllow = function(principalId, resource, contextData) {
    return generatePolicy(principalId, 'Allow', resource, contextData);
}
