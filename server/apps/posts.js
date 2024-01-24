import { Router } from "express";
import { connectionPool } from "../utils/db.js";

const postRouter = Router();

postRouter.get("/", async (req, res) => {
  const status = req.query.status || "";
  const keywords = req.query.keywords || "";
  const page = req.query.page || 1;

  const PAGE_SIZE = 5;
  const offset = (page - 1) * PAGE_SIZE;

  let query = "";
  let values = [];

  try {
    if (status && keywords) {
      query =
        "select * from posts where status=$1 and title ilike $2 limit $3 offset $4";
      values = [status, keywords, PAGE_SIZE, offset];
    } else if (status) {
      query = "select * from posts where status=$1 limit $2 offset $3";
      values = [status, PAGE_SIZE, offset];
    } else if (keywords) {
      query = "select * from posts where title ilike $1 limit $2 offset $3 ";
      values = [keywords, PAGE_SIZE, offset];
    } else {
      query = "select * from posts limit $1 offset $2";
      values = [PAGE_SIZE, offset];
    }

    const results = await connectionPool.query(query, values);

    return res.json({
      data: results.rows,
    });
  } catch (error) {
    return res.json({
      message: `${error}`,
    });
  }
});

postRouter.get("/:id", async (req, res) => {
  const postId = req.params.id;

  try {
    const results = await connectionPool.query(
      "select * from posts where post_id=$1",
      [postId]
    );

    console.log(results);
    return res.json({
      data: results.rows[0],
    });
  } catch (error) {
    return res.json({
      message: `${error}`,
    });
  }
});

postRouter.post("/", async (req, res) => {
  const hasPublished = req.body.status === "published";
  const newPost = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: hasPublished ? new Date() : null,
  };

  try {
    await connectionPool.query(
      "insert into posts(  user_id, title, content, status, likes, category, created_at, updated_at, published_at) values ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, CURRENT_TIMESTAMP))",
      [
        0,
        newPost.title,
        newPost.content,
        newPost.status,
        0,
        newPost.category,
        newPost.created_at,
        newPost.updated_at,
        newPost.published_at,
      ]
    );

    return res.json({
      message: "Post has been created.",
    });
  } catch (error) {
    return res.json({
      message: `${error}`,
    });
  }
});

postRouter.put("/:id", async (req, res) => {
  const hasPublished = req.body.status === "published";

  const updatedPost = {
    ...req.body,
    updated_at: new Date(),
    published_at: hasPublished ? new Date() : null,
  };
  const postId = req.params.id;

  try {
    await connectionPool.query(
      "update posts set title=$1, content=$2, status=$3, category=$4, updated_at=$5, published_at=COALESCE($6, CURRENT_TIMESTAMP) where post_id=$7",
      [
        updatedPost.title,
        updatedPost.content,
        updatedPost.status,
        updatedPost.category,
        updatedPost.updated_at,
        updatedPost.published_at,
        postId,
      ]
    );

    return res.json({
      message: `Post ${postId} has been updated.`,
    });
  } catch (error) {
    return res.json({
      message: `${error}`,
    });
  }
});

postRouter.delete("/:id", async (req, res) => {
  const postId = req.params.id;

  try {
    await connectionPool.query("delete from posts where post_id=$1", [postId]);

    return res.json({
      message: `Post ${postId} has been deleted.`,
    });
  } catch (error) {
    return res.json({
      message: `${error}`,
    });
  }
});

export default postRouter;
