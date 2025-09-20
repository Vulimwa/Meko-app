const express = require("express")
const mysql = require("mysql2")
const path = require("path")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const multer = require("multer")
const fs = require("fs")

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())
app.use(cors())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed!"), false)
    }
  },
})

// Database connection (MySQL)
const db = mysql.createConnection({
  host: "localhost",
  user: "Code",
  password: "12345678",
  database: "mekoDB"
})

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err.message)
  } else {
    console.log("Connected to MySQL database")
  }
})

// Import routes
const storiesRoutes = require("./routes/stories")
const threadsRoutes = require("./routes/threads")
const statsRoutes = require("./routes/stats")

// Use routes
app.use("/api/stories", storiesRoutes(db, upload))
app.use("/api/threads", threadsRoutes(db))
app.use("/api/stats", statsRoutes(db))

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error)
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large" })
    }
  }
  res.status(500).json({ error: "Internal server error" })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app
