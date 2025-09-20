# Meko Moja (One Stove) - Community Awareness Campaign & Tracker

A production-ready web application that encourages clean cooking adoption through community-driven awareness, cost savings calculations, and peer-to-peer learning in East Africa.

---

## 🌟 Features

- **Story Feed:** Share clean cooking journeys, experiences, and photos.
- **Cost & CO₂ Calculator:** Estimate savings and environmental impact when switching to clean fuels.
- **Community Forum:** Q&A and discussions about clean cooking, vendors, and best practices.
- **Vendor Map:** Interactive map showing LPG, electric, and biomass stove vendors.

---

## 📁 Project Structure
```
meko-moja/ ├── backend/ # Node.js + Express API │ ├── db/ # Database schema (MySQL) │ ├── routes/ # API route handlers (stories, threads, stats) │ ├── uploads/ # User uploaded images │ ├── server.js # Main server file │ └── package.json # Backend dependencies ├── frontend/ # Static web application │ ├── index.html # Main HTML file │ ├── styles.css # Responsive CSS │ ├── app.js # Vanilla JavaScript │ └── package.json # Frontend scripts ├── package.json # Project-level dependencies (for Next.js, etc.) └── README.md
```


---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MySQL server (for backend)
- Git

### Backend Setup

```
cd backend
npm install
# Ensure MySQL is running and database is created (see db/schema.sql)
npm start
```

### Frontend Setup
```
cd frontend
# Serve with any static file server
npx serve .
# Or use Python
python -m http.server 8000
```

### Access the App
   - Frontend: http://localhost:8000
   - Backend API: http://localhost:3001/api

### Technology Stack
   - Frontend: HTML5, CSS3, Vanilla JavaScript, Leaflet (for maps)
   -  Backend: Node.js, Express.js, MySQL, Multer (file uploads), Helmet (security), CORS, Rate Limiting

