const express = require("express")

module.exports = (db, upload) => {
  const router = express.Router()

  // Get all stories with pagination
  router.get("/", (req, res) => {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    const fuelType = req.query.fuel_type

    let query = `
      SELECT id, title, content, image_url, location, fuel_type, 
             author_name, likes_count, created_at
      FROM stories
    `
    const params = []

    if (fuelType) {
      query += " WHERE fuel_type = ?"
      params.push(fuelType)
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.push(limit, offset)

  db.query(query, params, (err, rows) => {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Failed to fetch stories" })
      }

      // Get total count for pagination
      let countQuery = "SELECT COUNT(*) as total FROM stories"
      const countParams = []
      if (fuelType) {
        countQuery += " WHERE fuel_type = ?"
        countParams.push(fuelType)
      }
      db.query(countQuery, countParams, (err, countRows) => {
        if (err) {
          console.error("Count error:", err)
          return res.status(500).json({ error: "Failed to count stories" })
        }
        const total = countRows[0]?.total || 0
        res.json({
          stories: rows,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        })
      })
    })
  })

  // Create new story
  router.post("/", upload.single("image"), (req, res) => {
    const { title, content, location, fuel_type, author_name } = req.body

    // Validation
    if (!title || !content || !author_name) {
      return res.status(400).json({ error: "Title, content, and author name are required" })
    }

    if (fuel_type && !["charcoal", "LPG", "electric", "improved_biomass"].includes(fuel_type)) {
      return res.status(400).json({ error: "Invalid fuel type" })
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : null

    const query = `
      INSERT INTO stories (title, content, image_url, location, fuel_type, author_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `

    db.query(query, [title, content, image_url, location, fuel_type, author_name], (err, result) => {
      if (err) {
        console.error("Insert error:", err)
        return res.status(500).json({ error: "Failed to create story" })
      }
      // Return the created story
      db.query("SELECT * FROM stories WHERE id = ?", [result.insertId], (err, rows) => {
        if (err) {
          console.error("Fetch error:", err)
          return res.status(500).json({ error: "Story created but failed to fetch" })
        }
        res.status(201).json(rows[0])
      })
    })
  })

  // Like a story
  router.post("/:id/like", (req, res) => {
    const storyId = req.params.id
    const userIdentifier = req.ip || "anonymous" // Use IP as user identifier

    // Check if user already liked this story
    db.query(
      "SELECT id FROM story_likes WHERE story_id = ? AND user_identifier = ?",
      [storyId, userIdentifier],
      (err, likeRows) => {
        if (err) {
          console.error("Like check error:", err)
          return res.status(500).json({ error: "Failed to check like status" })
        }
        if (likeRows.length > 0) {
          return res.status(400).json({ error: "Already liked this story" })
        }
        // Add like
        db.query(
          "INSERT INTO story_likes (story_id, user_identifier) VALUES (?, ?)",
          [storyId, userIdentifier],
          (err) => {
            if (err) {
              console.error("Like insert error:", err)
              return res.status(500).json({ error: "Failed to like story" })
            }
            // Update likes count
            db.query("UPDATE stories SET likes_count = likes_count + 1 WHERE id = ?", [storyId], (err) => {
              if (err) {
                console.error("Like count update error:", err)
                return res.status(500).json({ error: "Failed to update like count" })
              }
              // Return updated story
              db.query("SELECT * FROM stories WHERE id = ?", [storyId], (err, storyRows) => {
                if (err) {
                  console.error("Story fetch error:", err)
                  return res.status(500).json({ error: "Like added but failed to fetch story" })
                }
                res.json((storyRows && storyRows[0]) || {})
              })
            })
          },
        )
      },
    )
  })

  return router
}
