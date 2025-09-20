const express = require("express")

module.exports = (db) => {
  const router = express.Router()

  // Get community statistics
  router.get("/", (req, res) => {
    const queries = {
      totalStories: "SELECT COUNT(*) as count FROM stories",
      totalThreads: "SELECT COUNT(*) as count FROM threads",
      totalComments: "SELECT COUNT(*) as count FROM comments",
      fuelTypeDistribution: `
        SELECT fuel_type, COUNT(*) as count 
        FROM stories 
        WHERE fuel_type IS NOT NULL 
        GROUP BY fuel_type
      `,
      cleanFuelAdoption: `
        SELECT 
          COUNT(CASE WHEN fuel_type IN ('LPG', 'electric', 'improved_biomass') THEN 1 END) as clean_fuel_count,
          COUNT(*) as total_count
        FROM stories 
        WHERE fuel_type IS NOT NULL
      `,
    }

    const results = {}
    let completed = 0
    const totalQueries = Object.keys(queries).length

    Object.entries(queries).forEach(([key, query]) => {
      db.query(query, [], (err, rows) => {
        if (err) {
          console.error(`Error in ${key}:`, err)
          if (key === "fuelTypeDistribution") results[key] = []
          else results[key] = key === "cleanFuelAdoption" ? { clean_fuel_count: 0, total_count: 0 } : { count: 0 }
        } else {
          if (key === "fuelTypeDistribution") results[key] = rows
          else results[key] = rows[0]
        }
        completed++
        if (completed === totalQueries) {
          sendResponse()
        }
      })
    })

    function sendResponse() {
      // Calculate clean fuel adoption percentage
      const cleanFuelData = results.cleanFuelAdoption
      const adoptionPercentage =
        cleanFuelData.total_count > 0
          ? Math.round((cleanFuelData.clean_fuel_count / cleanFuelData.total_count) * 100)
          : 0

      res.json({
        totalStories: results.totalStories.count,
        totalThreads: results.totalThreads.count,
        totalComments: results.totalComments.count,
        fuelTypeDistribution: results.fuelTypeDistribution,
        cleanFuelAdoptionPercentage: adoptionPercentage,
        timestamp: new Date().toISOString(),
      })
    }
  })

  return router
}
