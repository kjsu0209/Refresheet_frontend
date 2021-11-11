# Refresheet Project - Frontend
> [Backend Repo 바로가기](https://github.com/kjsu0209/Refresheet_backend)

### Project
개인 프로젝트 - [jsooOO](https://github.com/kjsu0209)  
프로젝트 기간: 2021.08.09 ~ 2021.08.20  

### Refresheet이란?
관계형 데이터베이스 기반 Table 공동 편집 서비스

### Tech/Framework
- **[React.js](https://github.com/kjsu0209/Refresheet_frontend)**: 프론트엔드
- [Spring boot](https://github.com/kjsu0209/Refresheet_backend): API 서버 & 웹 소켓 서버
- Sock.js: 소켓 통신 라이브러리
- BootStrap

### 특징  
- 가독성, 성능 향상을 위해 Functional Component로 구현했습니다.  
- Functional Component는 Stateless 특성을 갖고 있어야 하지만, 실시간 편집 내용 공유 기능 때문에 state와 props를 함께 사용합니다.
- [Evolutionary Model](https://www.geeksforgeeks.org/software-engineering-evolutionary-model/)을 적용해, 단계적으로 프로젝트를 개선시켰습니다.  

> 개선 과정  
> Iter 1: 단순한 Table 편집 기능 구현(sheet, column, row 추가), cursor가 input 밖으로 나가는 이벤트 발생 시 DB 업데이트 요청(axoi)  
> Iter 2: column별 데이터타입 다양화(number, text, date), datepicker 적용  
> Iter 3: 웹 소켓 통신, onChange 이벤트로 실시간 데이터 변경 사항 공유 기능 구현  

### ScreenShots  
#### Table 편집  
편집되는 내용은 onChange이벤트로 실시간으로 웹 소켓 서버에 전송되고, 커서가 input창 밖으로 나가면 DB에 값이 업데이트됩니다.  
![image](https://user-images.githubusercontent.com/35682236/133249366-5763769d-3610-49cd-a366-e70a17d5df87.png)  
onChange 이벤트 발생 시, 같은 Sheet ID를 구독하는 구독자에게 변경 이벤트가 broadcast됩니다. 구독자는 구독자의 ip 주소와 웹 소켓 서버 연결 시 발급되는 session id로 구분합니다.    
![image](https://user-images.githubusercontent.com/35682236/133249424-1a76527e-7bf6-461d-b278-1dc627060454.png)

#### Column 추가  
텍스트, 숫자, 날짜 데이터 타입을 지정할 수 있습니다.  
![image](https://user-images.githubusercontent.com/35682236/133249399-4e770e2b-5be9-40f2-894e-34669a806b5a.png)  

지정한 데이터 타입에 따라 input의 유형이 바뀝니다.  
![image](https://user-images.githubusercontent.com/35682236/133249416-41fdc032-a25e-4295-bcda-3f249b0e9c02.png)

