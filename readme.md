샘플 API-Gateway(Rest) 공통 authorizer 배포
======================================
## 기본 필요사항
   * AWS IAM 권한 확인
   * AWS Credential 셋팅
   * node, npm 설치
   * serverless 설치

## 개발 필요사항
   * 공통 모듈에서 사용 할 package.json 모듈 설치
   * serverless.yml 에 사용할 기능 정의 및 배포
   * 로컬 테스트 방법

### 기본 필요사항 - AWS IAM 권한 확인
* serverless 배포시에 개발자 계정에 iam 권한이 필요하다.
* serverless 배포시 aws cloudformation 에 stack이 추가되면서 자동적으로 연관된 리소스가 배포 된다.
  이때 필요한 권한으로 cloudformation:createApplication 권한 필요
* cloudformation 에서 api-gateway 연결, lambda 생성, 호출 권한(Role) 생성 등이 이루어지기 때문에 아래 추가 권한 필요
    * lambdaFullAccess
    * 그 밖의 권한은 확인 필요
### 기본 필요사항 - AWS Credentials 셋팅
* credentials 셋팅
    * $ vi ~/.aws/credentials
      <pre><code>
      [default]
      aws_access_key_id=XXXXXXXXX
      aws_secret_access_key=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
      </code></pre>
    * $ vi ~/.aws/config
      <pre><code>
      [default]
      region=ap-northeast-2
      output=json
      </code></pre>
### 기본 필요사항 - node, npm 설치
* node, npm 설치
    1. homebrew 가 설치 되어 있어야 한다. 미설치시 명령어 실행. 설치 되어 있을 경우 pass
       <pre><code>
       $ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
       </code></pre>
    2. node, npm 설치
       <pre><code>
       $ brew install node
       </code></pre>
    3. 설치 완료시 아래 명령어로 버전 확인
       <pre><code>
       $ node -v
       $ npm -v
       </code></pre>
    4. yarn을 사용 하고 싶을 경우 아래 명령어로 설치(optional)
       <pre><code>
       $ brew install yarn --ignore-dependencies
       $ yarn -v
       </code></pre>
### 기본 필요사항 - serverless framework 모듈 설치
* serverless framework 모듈 설치
   <pre><code>
   $ npm install -g serverless
   </code></pre>

### 개발 필요사항 - 공통 모듈에서 사용 할 package.json 모듈 설치
* 각 lambda function에서 사용할 공통 라이브러리의 경우 layer를 사용하여 공통으로 사용 가능하기 때문에,
  package.json 에 필요한 라이브러리 추가 후 모듈 install 진행.
* Ex) JWToken 파싱을 위한 공통 라이브러리가 필요한 경우. jsonwebtoken
<pre><code>
layer 경로에서 명령어 실행
$ cd layers/gateway/authorizer
$ npm install jsonwebtoken
</code></pre>
* 공통 모듈이 필요 없을 경우 package.json 이 필요 없으며, serverless.yml 에서 공통 layer 항목이 필요 없다.

### 개발 필요사항 - serverless.yml 에 사용할 기능 정의 및 배포
* serverless.yml 파일에 기본적으로 필요사항과 설명 참조.
* serverless 배포 방법
<pre><code>
프로젝트 최상위 경로에서 명령어 실행
$ serveless deploy
단축어로 sls deploy 도 사용 가능
stage가 기본값 dev로 되어 있어 stage 환경 배포시에는
$ sls deploy -s stage
로 실행 가능
</code></pre>

