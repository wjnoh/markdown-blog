const Router = require("koa-router");
const postsCtrl = require("./posts.ctrl");

const posts = new Router();

posts.get("/", postsCtrl.list);
posts.post("/", postsCtrl.write);

// id를 파라미터로 받아오므로, 받아온 id를 검증하는 미들웨어 적용
posts.get("/:id", postsCtrl.checkObjectId, postsCtrl.read);
posts.delete("/:id", postsCtrl.checkObjectId, postsCtrl.remove);
posts.patch("/:id", postsCtrl.checkObjectId, postsCtrl.update);

module.exports = posts;
