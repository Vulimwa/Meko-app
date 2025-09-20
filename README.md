# Meko Moja (One Stove) - Community Awareness Campaign & Tracker

A production-ready web application that encourages clean cooking adoption through community-driven awareness, cost savings calculations, and peer-to-peer learning in East Africa.

## 🌟 Features

### Core Functionality
- **Story Feed**: Community members share their clean cooking journeys with photos and experiences
- **Cost Calculator**: Calculate potential savings from switching to clean fuels (LPG, electric, improved biomass)
- **Community Forum**: Q&A discussions about clean cooking, vendors, and best practices
- **Vendor Map**: Interactive map showing nearby LPG vendors, electric suppliers, and biomass stove dealers

### Technical Highlights
- **Mobile-first responsive design** optimized for East African users
- **Offline-capable** with service worker support
- **Production-ready** with Docker containerization
- **Secure** with rate limiting, input validation, and security headers
- **Accessible** following WCAG guidelines
- **Fast** with optimized assets and caching

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Production Deployment

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd meko-moja
   \`\`\`

2. **Start with Docker Compose**
   \`\`\`bash
   docker-compose up -d
   \`\`\`

3. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:3001

### Development Setup

1. **Start development environment**
   \`\`\`bash
   docker-compose -f docker-compose.dev.yml up -d
   \`\`\`

2. **Access development servers**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3001

### Manual Setup (Alternative)

#### Backend Setup
\`\`\`bash
cd backend
npm install
npm run init-db
npm start
\`\`\`

#### Frontend Setup
\`\`\`bash
cd frontend
# Serve with any static file server
python -m http.server 8000
# or
npx serve .
\`\`\`

## 📁 Project Structure

\`\`\`
meko-moja/
├── backend/                 # Node.js + Express API
│   ├── db/                 # SQLite database and schema
│   ├── routes/             # API route handlers
│   ├── uploads/            # User uploaded images
│   ├── server.js           # Main server file
│   ├── Dockerfile          # Production container
│   └── package.json        # Dependencies
├── frontend/               # Static web application
│   ├── index.html          # Main HTML file
│   ├── styles.css          # Responsive CSS
│   ├── app.js              # Vanilla JavaScript
│   ├── Dockerfile          # Nginx container
│   └── nginx.conf          # Production web server config
├── docker-compose.yml      # Production deployment
├── docker-compose.dev.yml  # Development environment
└── README.md              # This file
\`\`\`

## 🛠 Technology Stack

### Frontend
- **HTML5** with semantic markup and accessibility features
- **CSS3** with Flexbox/Grid, custom properties, and responsive design
- **Vanilla JavaScript** (ES6+) for optimal performance
- **Leaflet** for interactive maps with OpenStreetMap
- **Nginx** for production web serving

### Backend
- **Node.js** with Express.js framework
- **SQLite** database with optimized schema
- **Multer** for file upload handling
- **Helmet** for security headers
- **Rate limiting** and input validation

### DevOps
- **Docker** containerization for consistent deployments
- **Docker Compose** for multi-service orchestration
- **Nginx** reverse proxy and static file serving
- **Health checks** and restart policies

## 🌍 Deployment Options

### Cloud Platforms

#### Vercel (Recommended for Frontend)
\`\`\`bash
# Deploy frontend to Vercel
cd frontend
npx vercel --prod
\`\`\`

#### Railway (Recommended for Backend)
\`\`\`bash
# Deploy backend to Railway
cd backend
railway login
railway init
railway up
\`\`\`

#### DigitalOcean App Platform
- Upload docker-compose.yml
- Configure environment variables
- Deploy with one click

#### AWS/GCP/Azure
- Use container services (ECS, Cloud Run, Container Instances)
- Configure load balancers and databases as needed

### Self-Hosted
- VPS with Docker installed
- Reverse proxy (Nginx/Traefik) for HTTPS
- Backup strategy for SQLite database

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
\`\`\`bash
NODE_ENV=production
PORT=3001
DATABASE_PATH=./db/mekomoja.db
UPLOAD_PATH=./uploads
\`\`\`

#### Frontend
- No environment variables needed
- API endpoint configured in app.js

### Customization

#### Branding
- Update colors in `frontend/styles.css` (CSS custom properties)
- Replace logo in `frontend/index.html`
- Modify app name and descriptions

#### Localization
- Text strings are in HTML and JavaScript files
- Add translation support by extracting strings
- Consider right-to-left (RTL) support for Arabic regions

#### Map Data
- Vendor data in `frontend/app.js` (loadVendorData function)
- Replace with real vendor database integration
- Customize map center and zoom levels

## 📊 Performance

### Lighthouse Scores (Target)
- **Performance**: 95+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 90+

### Optimizations
- Gzip compression enabled
- Static asset caching (1 year)
- Image optimization and lazy loading
- Minimal JavaScript bundle
- Critical CSS inlined

## 🔒 Security

### Implemented Measures
- **Rate limiting**: 100 requests per 15 minutes per IP
- **Input validation**: All user inputs sanitized
- **File upload security**: Image-only, 5MB limit
- **Security headers**: XSS protection, CSRF prevention
- **SQL injection prevention**: Parameterized queries
- **HTTPS ready**: Security headers configured

### Production Checklist
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Regular security updates
- [ ] Database backups
- [ ] Error tracking (Sentry recommended)

## 🧪 Testing

### Manual Testing Checklist
- [ ] Story creation and image upload
- [ ] Calculator with various fuel types
- [ ] Forum thread creation and commenting
- [ ] Map vendor search and filtering
- [ ] Mobile responsiveness
- [ ] Accessibility with screen readers

### Automated Testing (Future)
\`\`\`bash
# Example test commands
npm test                    # Unit tests
npm run test:integration   # API tests
npm run test:e2e          # End-to-end tests
npm run lighthouse        # Performance tests
\`\`\`

## 📈 Analytics & Monitoring

### Recommended Tools
- **Google Analytics** for user behavior
- **Plausible** for privacy-friendly analytics
- **Sentry** for error tracking
- **Uptime Robot** for availability monitoring
- **LogRocket** for user session recording

### Key Metrics to Track
- Story creation rate
- Calculator usage
- Forum engagement
- Map interactions
- Mobile vs desktop usage
- Geographic distribution

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes and test locally
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open Pull Request

### Code Standards
- **HTML**: Semantic markup, accessibility attributes
- **CSS**: BEM methodology, mobile-first approach
- **JavaScript**: ES6+, functional programming preferred
- **Backend**: RESTful APIs, error handling, validation

## 📞 Support

### Getting Help
- **Documentation**: Check this README and inline comments
- **Issues**: Open GitHub issues for bugs and feature requests
- **Community**: Join discussions in the forum feature
- **Email**: [Your contact email]

### Common Issues

#### Database Connection Errors
\`\`\`bash
# Reinitialize database
cd backend
rm db/mekomoja.db
npm run init-db
\`\`\`

#### Port Conflicts
\`\`\`bash
# Check what's using the port
lsof -i :3001
# Kill the process or change port in docker-compose.yml
\`\`\`

#### File Upload Issues
\`\`\`bash
# Check upload directory permissions
chmod 755 backend/uploads
\`\`\`

## 🗺 Roadmap

### Phase 1 (Current)
- [x] Core story sharing functionality
- [x] Cost calculator with savings projections
- [x] Community forum for discussions
- [x] Interactive vendor map
- [x] Production deployment setup

### Phase 2 (Next 3 months)
- [ ] User authentication and profiles
- [ ] Push notifications for new stories
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support

### Phase 3 (6 months)
- [ ] Vendor verification system
- [ ] Payment integration for stove purchases
- [ ] Impact measurement tools
- [ ] Government partnership features
- [ ] Offline-first architecture

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Clean Cooking Alliance** for inspiration and research
- **OpenStreetMap** contributors for map data
- **Leaflet** team for the mapping library
- **East African clean cooking communities** for feedback and testing

---

**Built with ❤️ for clean cooking adoption in East Africa**

For questions, suggestions, or partnerships, please reach out to the development team.
