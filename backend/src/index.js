require("dotenv").config();

const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const mongoose = require("mongoose");
const api = require("./api");

// Nodejs에 내장된 Promise를 사용하도록 설정
mongoose.Promise = global.Promise;

// Nodejs에서 환경변수는 process.env로 조회
// PORT가 없을 경우 기본값은 4000
const { PORT: port = 4000, MONGO_URI: mongoURI } = process.env;

// mongoose로 서버에 데이터베이스 연결
mongoose
  .connect(
    mongoURI,
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch(e => {
    console.log(error(e));
  });

const app = new Koa();
const router = new Router();

// api에 있는 라우터 적용
router.use("/api", api.routes());

// 라우터 적용 전에 bodyParser 적용
app.use(bodyParser());

// app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());

// env에 있는 port로 실행
app.listen(port, () => {
  console.log("listening to port", port);
});
