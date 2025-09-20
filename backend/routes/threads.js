const express = require("express")

module.exports = (db) => {
  const router = express.Router()

  // Get all threads
  router.get("/", (req, res) => {
    const query = `
      SELECT id, title, content, author_name, replies_count, created_at
      FROM threads
      ORDER BY created_at DESC
    `

    db.query(query, [], (err, rows) => {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Failed to fetch threads" })
      }
      res.json(rows)
    })
  })

  // Create new thread
  router.post("/", (req, res) => {
    const { title, content, author_name } = req.body

    if (!title || !content || !author_name) {
      return res.status(400).json({ error: "Title, content, and author name are required" })
    }

    const query = `
      INSERT INTO threads (title, content, author_name)
      VALUES (?, ?, ?)
    `

    db.query(query, [title, content, author_name], (err, result) => {
      if (err) {
        console.error("Insert error:", err)
        return res.status(500).json({ error: "Failed to create thread" })
      }
      db.query("SELECT * FROM threads WHERE id = ?", [result.insertId], (err, rows) => {
        if (err) {
          console.error("Fetch error:", err)
          return res.status(500).json({ error: "Thread created but failed to fetch" })
        }
        res.status(201).json(rows[0])
      })
    })
  })

  // Get comments for a thread
  router.get("/:id/comments", (req, res) => {
    const threadId = req.params.id

    const query = `
      SELECT id, content, author_name, created_at
      FROM comments
      WHERE thread_id = ?
      ORDER BY created_at ASC
    `

    db.query(query, [threadId], (err, rows) => {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Failed to fetch comments" })
      }
      res.json(rows)
    })
  })

  // Add comment to thread
  router.post("/:id/comments", (req, res) => {
    const threadId = req.params.id
    const { content, author_name } = req.body

    if (!content || !author_name) {
      return res.status(400).json({ error: "Content and author name are required" })
    }

    const query = `
      INSERT INTO comments (thread_id, content, author_name)
      VALUES (?, ?, ?)
    `

    db.query(query, [threadId, content, author_name], (err, result) => {
      if (err) {
        console.error("Insert error:", err)
        return res.status(500).json({ error: "Failed to add comment" })
      }
      // Update replies count
      db.query("UPDATE threads SET replies_count = replies_count + 1 WHERE id = ?", [threadId], (err) => {
        if (err) {
          console.error("Replies count update error:", err)
        }
      })
      // Return the created comment
      db.query("SELECT * FROM comments WHERE id = ?", [result.insertId], (err, rows) => {
        if (err) {
          console.error("Fetch error:", err)
          return res.status(500).json({ error: "Comment added but failed to fetch" })
        }
        res.status(201).json(rows[0])
      })
    })
  })

  return router
}
