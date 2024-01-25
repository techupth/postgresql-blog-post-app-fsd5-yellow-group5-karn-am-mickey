import { Router } from "express";
import { connectionPool } from "../utils/db.js";

const postRouter = Router();

postRouter.get("/", async (req, res) => {
  const status = req.query.status || "";
  const keywords = req.query.keywords || "";
  const page = req.query.page;

  let query = "";
  let values = [];

  if (status && keywords) {
    query = `select * from posts
    where status=$1
    and title ilike $2
    limit 5`
    values = [status, keywords]
  } else if (keywords) {
    query = `select * from posts
    where title ilike $1
    limit 5`
    values = [keywords]
  } else if (status) {
    query = `select * from posts
    where status=$1
    limit 5`
    values = [status]
  }


  const results = await connectionPool.query(query, values);

  return res.json({
    data: results.rows,
  });
});

postRouter.get("/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    const result = await connectionPool.query(
      "select * from posts where post_id=$1",
      [postId]
    )

    return res.json({
      data: result.rows[0]
    })
  } catch (error) {
    return res.json({
      message: Error `${error}`
    })
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

  console.log("hello")
  try{
    await connectionPool.query(
      `insert into posts(title,content,status,created_at,updated_at)
      values ($1, $2, $3, $4, $5)`,
      [
        newPost.title,
        newPost.content,
        newPost.status,
        newPost.created_at,
        newPost.updated_at, 
      ]
    )
    return res.json({
      message: "Post has been created.",
    });
  } catch(error) {
    return res.json({
      message: Error `${error}`
    })
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
      `UPDATE posts
      SET title=$1,content=$2,status=$3,updated_at=$4,published_at=$5
      WHERE post_id=$6`,
      [
        updatedPost.title,
        updatedPost.content,
        updatedPost.status,
        updatedPost.updated_at,
        updatedPost.published_at,
        postId
      ]
    )
    return res.json({
      message: `Post ${postId} has been updated.`,
    });
  } catch (error) {
    return res.json({
      message: Error `${error}`
    })
  }
});

postRouter.delete("/:id", async (req, res) => {
  const postId = req.params.id;

  try {
    await connectionPool.query(`delete from posts where post_id=$1`, [postId])
    return res.json({
      message: `Post ${postId} has been deleted.`,
    });
  }catch (error) {
    return res.json({
      message: Error `${error}`
    })
  }
});

export default postRouter;
