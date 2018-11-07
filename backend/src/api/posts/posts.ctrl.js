const { ObjectId } = require("mongoose").Types;

// ObjectId를 검증하는 미들웨어
exports.checkObjectId = (ctx, next) => {
  const { id } = ctx.params;

  // id가 존재하지 않으면 400
  if (!ObjectId.isValid(id)) {
    ctx.status = 400;
    return null;
  }

  return next();
};

const Post = require("models/post");
const Joi = require("joi");

// 포스트 작성
exports.write = async ctx => {
  // Joi를 이용한 값 검증
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
    tags: Joi.array()
      .items(Joi.string())
      .required()
  });

  // 첫 번째 파라미터는 검증할 객체, 두 번째 파라미터는 스키마
  const result = Joi.validate(ctx.request.body, schema);

  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { title, body, tags } = ctx.request.body;

  const post = new Post({
    title,
    body,
    tags
  });

  try {
    await post.save();
    ctx.body = post;
  } catch (e) {
    ctx.throw(e, 500);
  }
};

// 포스트 목록 조회
exports.list = async ctx => {
  // query는 문자열 형태이므로 숫자로 변환
  // 값이 없으면 1페이지로
  const page = parseInt(ctx.query.page || 1, 10);

  // 잘못된 페이지 주어지면 400
  if (page < 1) {
    ctx.status = 400;
    return;
  }

  try {
    const posts = await Post.find()
      .sort({ _id: -1 }) // 역순(-1)
      .limit(10) // 보이는 개수
      .skip((page - 1) * 10) // 넘어갈 개수 지정(페이지네이션)
      .exec();

    // 200자까지만 표시
    const limitBodyLength = post => ({
      ...post.toJSON(),
      body: post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`
    });
    // 각각의 post에 모두 적용
    ctx.body = posts.map(limitBodyLength);

    const postCount = await Post.count().exec();
    // 커스텀 헤더로 마지막 페이지 표시
    // ctx.set은 response header를 설정
    ctx.set("Last-Page", Math.ceil(postCount / 10));
  } catch (e) {
    ctx.throw(e, 500);
  }
};

// 특정 포스트 조회
exports.read = async ctx => {
  const { id } = ctx.params;

  try {
    const post = await Post.findById(id).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(e, 500);
  }
};

// 특정 포스트 제거
exports.remove = async ctx => {
  const { id } = ctx.params;
  try {
    await Post.findByIdAndRemove(id).exec();
    ctx.status = 204;
  } catch (e) {
    ctx.throw(e, 500);
  }
};

// 포스트 수정(특정 필드 변경)
exports.update = async ctx => {
  // Joi를 이용한 값 검증
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
    tags: Joi.array()
      .items(Joi.string())
      .required()
  });

  // 첫 번째 파라미터는 검증할 객체, 두 번째 파라미터는 스키마
  const result = Joi.validate(ctx.request.body, schema);

  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { id } = ctx.params;

  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true
      // 이 값을 설정해야 업데이트된 객체 반환.
      // 이 값 설정 없으면 업데이트 되기 전의 객체 반환.
    }).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(e, 500);
  }
};
