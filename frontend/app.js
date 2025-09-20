// API Configuration
const API_BASE_URL = "http://localhost:3001/api"

// Global State
const currentPage = 1
const currentFilter = ""
const isLoading = false
const hasMoreStories = true
const calculatorResults = null
let currentThreadId = null // Forum State
let forumStats = { totalThreads: 0, totalComments: 0 } // Forum Stats
let map = null
let userLocation = null
let vendorMarkers = []
let userMarker = null

// DOM Elements
const elements = {
  storiesFeed: document.getElementById("storiesFeed"),
  loadingSpinner: document.getElementById("loadingSpinner"),
  loadMoreBtn: document.getElementById("loadMoreBtn"),
  fuelFilter: document.getElementById("fuelFilter"),
  addStoryBtn: document.getElementById("addStoryBtn"),
  addStoryModal: document.getElementById("addStoryModal"),
  closeModalBtn: document.getElementById("closeModalBtn"),
  cancelBtn: document.getElementById("cancelBtn"),
  storyForm: document.getElementById("storyForm"),
  charCount: document.getElementById("charCount"),
  storyContent: document.getElementById("storyContent"),
  toast: document.getElementById("toast"),
  toastMessage: document.getElementById("toastMessage"),
  submitBtn: document.getElementById("submitBtn"),
  btnText: document.querySelector(".btn-text"),
  btnSpinner: document.querySelector(".btn-spinner"),
  calculatorForm: document.getElementById("calculatorForm"),
  shareResultBtn: document.getElementById("shareResultBtn"),
  // Forum Elements
  threadList: document.getElementById("threadList"),
  threadDetail: document.getElementById("threadDetail"),
  newThreadBtn: document.getElementById("newThreadBtn"),
  newThreadModal: document.getElementById("newThreadModal"),
  closeThreadModalBtn: document.getElementById("closeThreadModalBtn"),
  cancelThreadBtn: document.getElementById("cancelThreadBtn"),
  threadForm: document.getElementById("threadForm"),
  backToThreadsBtn: document.getElementById("backToThreadsBtn"),
  commentForm: document.getElementById("commentForm"),
  forumLoadingSpinner: document.getElementById("forumLoadingSpinner"),
  // Map Elements
  searchLocationBtn: document.getElementById("searchLocationBtn"),
  locationSearch: document.getElementById("locationSearch"),
  showLPG: document.getElementById("showLPG"),
  showElectric: document.getElementById("showElectric"),
  showBiomass: document.getElementById("showBiomass"),
  vendorCards: document.getElementById("vendorCards"),
}

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

function initializeApp() {
  setupEventListeners()
  loadStories()
  setupTabNavigation()
  setupCalculator()
  setupForum()
  setupMap() // Added map initialization
}

// Event Listeners
function setupEventListeners() {
  // Filter change
  elements.fuelFilter.addEventListener("change", handleFilterChange)

  // Load more button
  elements.loadMoreBtn.addEventListener("click", loadMoreStories)

  // Modal controls
  elements.addStoryBtn.addEventListener("click", openModal)
  elements.closeModalBtn.addEventListener("click", closeModal)
  elements.cancelBtn.addEventListener("click", closeModal)

  // Form submission
  elements.storyForm.addEventListener("submit", handleStorySubmission)

  // Character counter
  elements.storyContent.addEventListener("input", updateCharCount)

  // Close modal on outside click
  elements.addStoryModal.addEventListener("click", (e) => {
    if (e.target === elements.addStoryModal) {
      closeModal()
    }
  })

  // Keyboard navigation
  document.addEventListener("keydown", handleKeyboardNavigation)
}

// Tab Navigation
function setupTabNavigation() {
  const navItems = document.querySelectorAll(".nav-item")
  const tabContents = document.querySelectorAll(".tab-content")

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const targetTab = item.dataset.tab;

      // Update active nav item
      navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");

      // Update active tab content
      tabContents.forEach((tab) => tab.classList.remove("active"));
      document.getElementById(targetTab).classList.add("active");

      // Show add story button only on feed tab
      if (elements.addStoryBtn) {
        if (targetTab === "feedTab") {
          elements.addStoryBtn.style.display = "";
        } else {
          elements.addStoryBtn.style.display = "none";
        }
      }

      // Load forum data when forum tab is activated
      if (targetTab === "forumTab") {
        loadForumData();
      }

      if (targetTab === "mapTab") {
        initializeMap();
      }
    });
  });

  // On load, ensure add story button is only visible on feed tab
  if (elements.addStoryBtn) {
    const activeTab = document.querySelector('.nav-item.active')?.dataset.tab;
    if (activeTab === "feedTab") {
      elements.addStoryBtn.style.display = "";
    } else {
      elements.addStoryBtn.style.display = "none";
    }
  }
}

// Forum Functions
function setupForum() {
  // Forum event listeners
  if (elements.newThreadBtn) {
    elements.newThreadBtn.addEventListener("click", openThreadModal)
  }

  if (elements.closeThreadModalBtn) {
    elements.closeThreadModalBtn.addEventListener("click", closeThreadModal)
  }

  if (elements.cancelThreadBtn) {
    elements.cancelThreadBtn.addEventListener("click", closeThreadModal)
  }

  if (elements.threadForm) {
    elements.threadForm.addEventListener("submit", handleThreadSubmission)
  }

  if (elements.backToThreadsBtn) {
    elements.backToThreadsBtn.addEventListener("click", showThreadList)
  }

  if (elements.commentForm) {
    elements.commentForm.addEventListener("submit", handleCommentSubmission)
  }

  // Character counters for forum
  const threadContent = document.getElementById("threadContent")
  const commentContent = document.getElementById("commentContent")

  if (threadContent) {
    threadContent.addEventListener("input", () => updateForumCharCount("thread"))
  }

  if (commentContent) {
    commentContent.addEventListener("input", () => updateForumCharCount("comment"))
  }

  // Close thread modal on outside click
  if (elements.newThreadModal) {
    elements.newThreadModal.addEventListener("click", (e) => {
      if (e.target === elements.newThreadModal) {
        closeThreadModal()
      }
    })
  }
}

async function loadForumData() {
  if (!elements.threadList) return

  try {
    // Load threads and stats
    const [threadsData, statsData] = await Promise.all([fetchThreads(), fetchForumStats()])

    if (threadsData) {
      renderThreads(threadsData)
    }

    if (statsData) {
      updateForumStats(statsData)
    }
  } catch (error) {
    console.error("Error loading forum data:", error)
    showToast("Failed to load forum data", "error")
  }
}

async function fetchThreads() {
  try {
    const response = await fetch(`${API_BASE_URL}/threads`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching threads:", error)
    return null
  }
}

async function fetchForumStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching forum stats:", error)
    return null
  }
}

async function fetchThreadComments(threadId) {
  try {
    const response = await fetch(`${API_BASE_URL}/threads/${threadId}/comments`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching comments:", error)
    return null
  }
}

async function createThread(formData) {
  try {
    const response = await fetch(`${API_BASE_URL}/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object.fromEntries(formData)),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create thread")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error creating thread:", error)
    throw error
  }
}

async function createComment(threadId, formData) {
  try {
    const response = await fetch(`${API_BASE_URL}/threads/${threadId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object.fromEntries(formData)),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create comment")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error creating comment:", error)
    throw error
  }
}

function renderThreads(threads) {
  if (!elements.threadList) return

  if (threads.length === 0) {
    elements.threadList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💬</div>
                <h3>No discussions yet</h3>
                <p>Be the first to start a conversation about clean cooking!</p>
            </div>
        `
    return
  }

  const threadsHTML = threads.map((thread) => createThreadHTML(thread)).join("")
  elements.threadList.innerHTML = threadsHTML

  // Add click listeners to thread cards
  attachThreadClickListeners()
}

function createThreadHTML(thread) {
  const formattedDate = new Date(thread.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const replyText = thread.replies_count === 1 ? "reply" : "replies"

  return `
        <div class="thread-card" data-thread-id="${thread.id}" tabindex="0" role="button" aria-label="Open discussion: ${escapeHtml(thread.title)}">
            <div class="thread-header">
                <h3 class="thread-title">${escapeHtml(thread.title)}</h3>
                <div class="thread-replies">
                    <span>💬</span>
                    <span>${thread.replies_count} ${replyText}</span>
                </div>
            </div>
            <p class="thread-content">${escapeHtml(thread.content)}</p>
            <div class="thread-meta">
                <div class="thread-author">by ${escapeHtml(thread.author_name)}</div>
                <div class="thread-date">${formattedDate}</div>
            </div>
        </div>
    `
}

function attachThreadClickListeners() {
  const threadCards = document.querySelectorAll(".thread-card:not([data-listener])")

  threadCards.forEach((card) => {
    card.setAttribute("data-listener", "true")
    card.addEventListener("click", handleThreadClick)
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        handleThreadClick(e)
      }
    })
  })
}

async function handleThreadClick(e) {
  const threadCard = e.currentTarget
  const threadId = threadCard.dataset.threadId

  if (!threadId) return

  currentThreadId = threadId
  await showThreadDetail(threadId)
}

async function showThreadDetail(threadId) {
  if (!elements.threadDetail || !elements.threadList) return

  try {
    // Hide thread list, show thread detail
    elements.threadList.style.display = "none"
    elements.threadDetail.style.display = "block"

    // Load thread data and comments
    const [threadsData, commentsData] = await Promise.all([fetchThreads(), fetchThreadComments(threadId)])

    const thread = threadsData?.find((t) => t.id.toString() === threadId.toString())

    if (!thread) {
      showToast("Thread not found", "error")
      showThreadList()
      return
    }

    // Render thread detail
    renderThreadDetail(thread)

    // Render comments
    if (commentsData) {
      renderComments(commentsData)
    }

    // Scroll to top
    elements.threadDetail.scrollIntoView({ behavior: "smooth", block: "start" })
  } catch (error) {
    console.error("Error showing thread detail:", error)
    showToast("Failed to load discussion", "error")
    showThreadList()
  }
}

function renderThreadDetail(thread) {
  const threadDetailContent = document.getElementById("threadDetailContent")
  if (!threadDetailContent) return

  const formattedDate = new Date(thread.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  threadDetailContent.innerHTML = `
        <h1 class="thread-detail-title">${escapeHtml(thread.title)}</h1>
        <div class="thread-detail-text">${escapeHtml(thread.content)}</div>
        <div class="thread-detail-meta">
            <div class="thread-detail-author">by ${escapeHtml(thread.author_name)}</div>
            <div class="thread-detail-date">${formattedDate}</div>
        </div>
    `
}

function renderComments(comments) {
  const commentsList = document.getElementById("commentsList")
  if (!commentsList) return

  if (comments.length === 0) {
    commentsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💭</div>
                <h3>No comments yet</h3>
                <p>Be the first to share your thoughts!</p>
            </div>
        `
    return
  }

  const commentsHTML = comments.map((comment) => createCommentHTML(comment)).join("")
  commentsList.innerHTML = commentsHTML
}

function createCommentHTML(comment) {
  const formattedDate = new Date(comment.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return `
        <div class="comment-card">
            <div class="comment-content">${escapeHtml(comment.content)}</div>
            <div class="comment-meta">
                <div class="comment-author">${escapeHtml(comment.author_name)}</div>
                <div class="comment-date">${formattedDate}</div>
            </div>
        </div>
    `
}

function showThreadList() {
  if (!elements.threadDetail || !elements.threadList) return

  elements.threadDetail.style.display = "none"
  elements.threadList.style.display = "block"
  currentThreadId = null

  // Refresh thread list to show updated reply counts
  loadForumData()
}

function updateForumStats(stats) {
  const totalThreadsEl = document.getElementById("totalThreads")
  const totalCommentsEl = document.getElementById("totalComments")

  if (totalThreadsEl) {
    totalThreadsEl.textContent = stats.totalThreads || 0
  }

  if (totalCommentsEl) {
    totalCommentsEl.textContent = stats.totalComments || 0
  }

  forumStats = {
    totalThreads: stats.totalThreads || 0,
    totalComments: stats.totalComments || 0,
  }
}

// Forum Modal Functions
function openThreadModal() {
  if (!elements.newThreadModal) return

  elements.newThreadModal.classList.add("active")
  document.body.style.overflow = "hidden"

  // Focus the first input for accessibility
  setTimeout(() => {
    const titleInput = document.getElementById("threadTitle")
    if (titleInput) titleInput.focus()
  }, 100)
}

function closeThreadModal() {
  if (!elements.newThreadModal) return

  elements.newThreadModal.classList.remove("active")
  document.body.style.overflow = ""
  resetThreadForm()
}

function resetThreadForm() {
  if (elements.threadForm) {
    elements.threadForm.reset()
    updateForumCharCount("thread")
  }
}

// Forum Form Handlers
async function handleThreadSubmission(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const submitBtn = e.target.querySelector(".btn-primary")
  const btnText = submitBtn.querySelector(".btn-text")
  const btnSpinner = submitBtn.querySelector(".btn-spinner")

  // Show loading state
  submitBtn.disabled = true
  btnText.style.display = "none"
  btnSpinner.style.display = "block"

  try {
    const newThread = await createThread(formData)
    showToast("Discussion started successfully!")
    closeThreadModal()

    // Refresh forum data
    await loadForumData()
  } catch (error) {
    showToast(error.message, "error")
  } finally {
    // Reset button state
    submitBtn.disabled = false
    btnText.style.display = "block"
    btnSpinner.style.display = "none"
  }
}

async function handleCommentSubmission(e) {
  e.preventDefault()

  if (!currentThreadId) {
    showToast("No thread selected", "error")
    return
  }

  const formData = new FormData(e.target)
  const submitBtn = e.target.querySelector(".btn-primary")
  const btnText = submitBtn.querySelector(".btn-text")
  const btnSpinner = submitBtn.querySelector(".btn-spinner")

  // Show loading state
  submitBtn.disabled = true
  btnText.style.display = "none"
  btnSpinner.style.display = "block"

  try {
    const newComment = await createComment(currentThreadId, formData)
    showToast("Comment posted successfully!")

    // Reset form
    e.target.reset()
    updateForumCharCount("comment")

    // Refresh comments
    const commentsData = await fetchThreadComments(currentThreadId)
    if (commentsData) {
      renderComments(commentsData)
    }

    // Update stats
    const statsData = await fetchForumStats()
    if (statsData) {
      updateForumStats(statsData)
    }
  } catch (error) {
    showToast(error.message, "error")
  } finally {
    // Reset button state
    submitBtn.disabled = false
    btnText.style.display = "block"
    btnSpinner.style.display = "none"
  }
}

function updateForumCharCount(type) {
  let contentEl, countEl, maxLength

  if (type === "thread") {
    contentEl = document.getElementById("threadContent")
    countEl = document.getElementById("threadCharCount")
    maxLength = 500
  } else if (type === "comment") {
    contentEl = document.getElementById("commentContent")
    countEl = document.getElementById("commentCharCount")
    maxLength = 300
  }

  if (!contentEl || !countEl) return

  const currentLength = contentEl.value.length
  countEl.textContent = currentLength

  const warningThreshold = maxLength * 0.8
  const dangerThreshold = maxLength * 0.9

  if (currentLength > dangerThreshold) {
    countEl.style.color = "#e53e3e"
  } else if (currentLength > warningThreshold) {
    countEl.style.color = "#FF6B35"
  } else {
    countEl.style.color = "#718096"
  }
}

// Map Functions
function setupMap() {
  const searchLocationBtn = document.getElementById("searchLocationBtn")
  const locationSearch = document.getElementById("locationSearch")
  const showLPG = document.getElementById("showLPG")
  const showElectric = document.getElementById("showElectric")
  const showBiomass = document.getElementById("showBiomass")

  if (searchLocationBtn) {
    searchLocationBtn.addEventListener("click", handleLocationSearch)
  }

  if (locationSearch) {
    locationSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleLocationSearch()
      }
    })
  }

  // Filter event listeners
  if (showLPG) {
    showLPG.addEventListener("change", updateMapFilters)
  }
  if (showElectric) {
    showElectric.addEventListener("change", updateMapFilters)
  }
  if (showBiomass) {
    showBiomass.addEventListener("change", updateMapFilters)
  }
}

function initializeMap() {
  if (map) return // Map already initialized

  const mapElement = document.getElementById("map")
  if (!mapElement) return

  try {
    // Import Leaflet library
    const L = window.L

    // Initialize map centered on Nairobi, Kenya
    map = L.map("map").setView([-1.2921, 36.8219], 12)

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map)

    // Try to get user's location
    getUserLocation()

    // Load demo vendor data
    loadVendorData()

    showToast("Map loaded successfully!")
  } catch (error) {
    console.error("Error initializing map:", error)
    showMapError("Failed to load map. Please try again.")
  }
}

function getUserLocation() {
  if (!navigator.geolocation) {
    console.log("Geolocation is not supported by this browser")
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }

      // Add user location marker
      if (userMarker) {
        map.removeLayer(userMarker)
      }

      userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: createCustomIcon("user"),
      })
        .addTo(map)
        .bindPopup(
          `<div class="custom-popup">
                        <div class="popup-header">Your Location</div>
                        <div class="popup-address">Current position</div>
                    </div>`,
        )

      // Center map on user location
      map.setView([userLocation.lat, userLocation.lng], 14)

      showToast("Location found!")
    },
    (error) => {
      console.log("Error getting location:", error)
      // Keep default location (Nairobi)
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
    },
  )
}

function loadVendorData() {
  // Demo vendor data for East African cities
  const demoVendors = [
    {
      id: 1,
      name: "Hashi Energy LPG",
      type: "lpg",
      lat: -1.2921,
      lng: 36.8219,
      address: "Kenyatta Avenue, Nairobi",
      phone: "+254 700 123 456",
      rating: 4.5,
      services: ["LPG Cylinders", "Refills", "Delivery"],
    },
    {
      id: 2,
      name: "Total Gas Station",
      type: "lpg",
      lat: -1.3032,
      lng: 36.8235,
      address: "Uhuru Highway, Nairobi",
      phone: "+254 700 234 567",
      rating: 4.2,
      services: ["LPG Cylinders", "Refills"],
    },
    {
      id: 3,
      name: "PowerMax Electric Stoves",
      type: "electric",
      lat: -1.2845,
      lng: 36.8156,
      address: "Tom Mboya Street, Nairobi",
      phone: "+254 700 345 678",
      rating: 4.7,
      services: ["Electric Stoves", "Installation", "Repair"],
    },
    {
      id: 4,
      name: "EcoStove Solutions",
      type: "biomass",
      lat: -1.3021,
      lng: 36.8345,
      address: "Moi Avenue, Nairobi",
      phone: "+254 700 456 789",
      rating: 4.3,
      services: ["Improved Biomass Stoves", "Training"],
    },
    {
      id: 5,
      name: "Lake Gas Distributors",
      type: "lpg",
      lat: -1.2756,
      lng: 36.8089,
      address: "River Road, Nairobi",
      phone: "+254 700 567 890",
      rating: 4.1,
      services: ["LPG Cylinders", "Bulk Supply"],
    },
    {
      id: 6,
      name: "Green Energy Electric",
      type: "electric",
      lat: -1.3156,
      lng: 36.8423,
      address: "Ngong Road, Nairobi",
      phone: "+254 700 678 901",
      rating: 4.6,
      services: ["Electric Stoves", "Solar Integration"],
    },
    {
      id: 7,
      name: "Clean Cook Biomass",
      type: "biomass",
      lat: -1.2689,
      lng: 36.8034,
      address: "Eastleigh, Nairobi",
      phone: "+254 700 789 012",
      rating: 4.4,
      services: ["Improved Stoves", "Fuel Supply"],
    },
    {
      id: 8,
      name: "City Gas Express",
      type: "lpg",
      lat: -1.3234,
      lng: 36.8567,
      address: "Karen Road, Nairobi",
      phone: "+254 700 890 123",
      rating: 4.8,
      services: ["LPG Delivery", "24/7 Service"],
    },
  ]

  // Clear existing markers
  vendorMarkers.forEach((marker) => {
    map.removeLayer(marker)
  })
  vendorMarkers = []

  // Add vendor markers
  demoVendors.forEach((vendor) => {
    const marker = L.marker([vendor.lat, vendor.lng], {
      icon: createCustomIcon(vendor.type),
    })
      .addTo(map)
      .bindPopup(createVendorPopup(vendor))

    // Add click event to center on vendor
    marker.on("click", () => {
      map.setView([vendor.lat, vendor.lng], 16)
    })

    vendorMarkers.push({ marker, vendor })
  })

  // Update vendor list
  updateVendorList(demoVendors)
}

function createCustomIcon(type) {
  const iconColors = {
    lpg: "#3182ce",
    electric: "#805ad5",
    biomass: "#236b4b",
    user: "#ff6b35",
  }

  const iconHtml = `
        <div style="
            background-color: ${iconColors[type]};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: white;
            font-weight: bold;
        ">
            ${type === "lpg" ? "🔥" : type === "electric" ? "⚡" : type === "biomass" ? "🌿" : "📍"}
        </div>
    `

  return L.divIcon({
    html: iconHtml,
    className: "custom-marker",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  })
}

function createVendorPopup(vendor) {
  return `
        <div class="custom-popup">
            <div class="popup-header">${escapeHtml(vendor.name)}</div>
            <div class="popup-type ${vendor.type}">${vendor.type.replace("_", " ")}</div>
            <div class="popup-address">📍 ${escapeHtml(vendor.address)}</div>
            <div class="popup-phone">📞 ${escapeHtml(vendor.phone)}</div>
        </div>
    `
}

function updateVendorList(vendors) {
  const vendorCards = document.getElementById("vendorCards")
  if (!vendorCards) return

  if (vendors.length === 0) {
    vendorCards.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🗺️</div>
                <h3>No vendors found</h3>
                <p>Try adjusting your filters or search location.</p>
            </div>
        `
    return
  }

  // Sort vendors by distance if user location is available
  let sortedVendors = [...vendors]
  if (userLocation) {
    sortedVendors = vendors
      .map((vendor) => ({
        ...vendor,
        distance: calculateDistance(userLocation.lat, userLocation.lng, vendor.lat, vendor.lng),
      }))
      .sort((a, b) => a.distance - b.distance)
  }

  const vendorHTML = sortedVendors.map((vendor) => createVendorCardHTML(vendor)).join("")
  vendorCards.innerHTML = vendorHTML

  // Add click listeners to vendor cards
  attachVendorCardListeners()
}

function createVendorCardHTML(vendor) {
  const distanceText = vendor.distance ? `${vendor.distance.toFixed(1)} km away` : "Distance unknown"

  return `
        <div class="vendor-card" data-vendor-id="${vendor.id}" data-lat="${vendor.lat}" data-lng="${vendor.lng}" 
             tabindex="0" role="button" aria-label="View ${vendor.name} on map">
            <div class="vendor-header">
                <h4 class="vendor-name">${escapeHtml(vendor.name)}</h4>
                <span class="vendor-type ${vendor.type}">${vendor.type.replace("_", " ")}</span>
            </div>
            <div class="vendor-info">
                <div class="vendor-address">
                    <span>📍</span>
                    ${escapeHtml(vendor.address)}
                </div>
                <div class="vendor-phone">
                    <span>📞</span>
                    ${escapeHtml(vendor.phone)}
                </div>
            </div>
            <div class="vendor-meta">
                <div class="vendor-distance">${distanceText}</div>
                <div class="vendor-rating">
                    <span>⭐</span>
                    <span>${vendor.rating}</span>
                </div>
            </div>
        </div>
    `
}

function attachVendorCardListeners() {
  const vendorCards = document.querySelectorAll(".vendor-card:not([data-listener])")

  vendorCards.forEach((card) => {
    card.setAttribute("data-listener", "true")
    card.addEventListener("click", handleVendorCardClick)
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        handleVendorCardClick(e)
      }
    })
  })
}

function handleVendorCardClick(e) {
  const card = e.currentTarget
  const lat = Number.parseFloat(card.dataset.lat)
  const lng = Number.parseFloat(card.dataset.lng)

  if (map && !Number.isNaN(lat) && !Number.isNaN(lng)) {
    map.setView([lat, lng], 16)

    // Find and open the corresponding marker popup
    const marker = vendorMarkers.find((vm) => vm.vendor.lat === lat && vm.vendor.lng === lng)
    if (marker) {
      marker.marker.openPopup()
    }

    // Scroll map into view on mobile
    if (window.innerWidth <= 768) {
      document.getElementById("map").scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }
}

function updateMapFilters() {
  const showLPG = document.getElementById("showLPG")?.checked ?? true
  const showElectric = document.getElementById("showElectric")?.checked ?? true
  const showBiomass = document.getElementById("showBiomass")?.checked ?? true

  // Filter vendors based on checkboxes
  const filteredVendors = []

  vendorMarkers.forEach(({ marker, vendor }) => {
    let shouldShow = false

    if (vendor.type === "lpg" && showLPG) shouldShow = true
    if (vendor.type === "electric" && showElectric) shouldShow = true
    if (vendor.type === "biomass" && showBiomass) shouldShow = true

    if (shouldShow) {
      if (!map.hasLayer(marker)) {
        map.addLayer(marker)
      }
      filteredVendors.push(vendor)
    } else {
      if (map.hasLayer(marker)) {
        map.removeLayer(marker)
      }
    }
  })

  // Update vendor list
  updateVendorList(filteredVendors)
}

async function handleLocationSearch() {
  const locationInput = document.getElementById("locationSearch")
  const searchQuery = locationInput?.value?.trim()

  if (!searchQuery) {
    showToast("Please enter a location to search", "error")
    return
  }

  try {
    // Simple geocoding using Nominatim (OpenStreetMap)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=ke,ug,tz,rw`,
    )

    if (!response.ok) {
      throw new Error("Search failed")
    }

    const results = await response.json()

    if (results.length === 0) {
      showToast("Location not found. Try a different search term.", "error")
      return
    }

    const result = results[0]
    const lat = Number.parseFloat(result.lat)
    const lng = Number.parseFloat(result.lon)

    // Update map view
    map.setView([lat, lng], 14)

    // Add/update search marker
    if (userMarker) {
      map.removeLayer(userMarker)
    }

    userMarker = L.marker([lat, lng], {
      icon: createCustomIcon("user"),
    })
      .addTo(map)
      .bindPopup(
        `<div class="custom-popup">
                    <div class="popup-header">Search Result</div>
                    <div class="popup-address">${escapeHtml(result.display_name)}</div>
                </div>`,
      )
      .openPopup()

    // Update user location for distance calculations
    userLocation = { lat, lng }

    // Refresh vendor list with new distances
    const allVendors = vendorMarkers.map((vm) => vm.vendor)
    updateVendorList(allVendors)

    showToast(`Found: ${result.display_name}`)
  } catch (error) {
    console.error("Location search error:", error)
    showToast("Failed to search location. Please try again.", "error")
  }
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function showMapError(message) {
  const mapElement = document.getElementById("map")
  if (!mapElement) return

  mapElement.innerHTML = `
        <div class="map-error">
            <h3>Map Error</h3>
            <p>${message}</p>
        </div>
    `
}

// Utility Functions
function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

// Declare missing functions
async function loadStories() {
  elements.loadingSpinner.style.display = "block"
  elements.storiesFeed.innerHTML = ""
  try {
    const res = await fetch(`${API_BASE_URL}/stories`)
    if (!res.ok) throw new Error("Failed to fetch stories")
    const data = await res.json()
    if (!data.stories || data.stories.length === 0) {
      elements.storiesFeed.innerHTML = '<div class="empty-feed">No stories found.</div>'
    } else {
      elements.storiesFeed.innerHTML = data.stories.map(story => `
        <div class="story-card">
          ${story.image_url ? `<img src="${story.image_url}" alt="Story image" class="story-image">` : ""}
          <div class="story-content">
            <div class="story-header">
              <h3 class="story-title">${escapeHtml(story.title)}</h3>
              <span class="story-meta">By ${escapeHtml(story.author_name)}</span>
            </div>
            <p>${escapeHtml(story.content)}</p>
            <div class="story-meta">
              <span>${story.fuel_type ? escapeHtml(story.fuel_type) : ""}</span>
              <span>${story.location ? escapeHtml(story.location) : ""}</span>
              <span>${story.created_at ? new Date(story.created_at).toLocaleString() : ""}</span>
              <span>Likes: ${story.likes_count || 0}</span>
            </div>
          </div>
        </div>
      `).join("")
    }
  } catch (err) {
    elements.storiesFeed.innerHTML = `<div class=\"error\">Error loading stories: ${err.message}</div>`
  } finally {
    elements.loadingSpinner.style.display = "none"
  }
}

function setupCalculator() {
  if (!elements.calculatorForm) return;
  elements.calculatorForm.addEventListener("submit", function(e) {
    e.preventDefault();
    // Get form values
    const currentFuel = elements.calculatorForm.currentFuel.value;
    const dailySpend = parseFloat(elements.calculatorForm.dailySpend.value) || 0;
    const mealsPerDay = parseInt(elements.calculatorForm.mealsPerDay.value) || 1;
    const householdSize = parseInt(elements.calculatorForm.householdSize.value) || 1;
    const cleanFuel = elements.calculatorForm.cleanFuel.value;

    // Simple mock calculation logic (replace with real logic as needed)
    let monthlyCurrent = dailySpend * 30;
    let monthlyClean = monthlyCurrent * 0.7; // Assume 30% savings for clean fuel
    let yearlyCurrent = monthlyCurrent * 12;
    let yearlyClean = monthlyClean * 12;
    let co2Savings = (monthlyCurrent - monthlyClean) * 2; // Mock CO2
    let timeSavings = mealsPerDay * 0.2 * 7; // Mock: 0.2hr saved per meal per week

    // Update results
    document.getElementById("monthlySavings").textContent = `KES ${Math.round(monthlyCurrent - monthlyClean)}`;
    document.getElementById("monthlyPercentage").textContent = `${Math.round(100 * (monthlyCurrent - monthlyClean) / monthlyCurrent)}% less`;
    document.getElementById("yearlySavings").textContent = `KES ${Math.round(yearlyCurrent - yearlyClean)}`;
    document.getElementById("yearlyPercentage").textContent = `${Math.round(100 * (yearlyCurrent - yearlyClean) / yearlyCurrent)}% less`;
    document.getElementById("co2Savings").textContent = `${Math.round(co2Savings)} kg`;
    document.getElementById("timeSavings").textContent = `${Math.round(timeSavings)}`;
    document.getElementById("currentBarValue").textContent = `KES ${Math.round(monthlyCurrent)}`;
    document.getElementById("cleanBarValue").textContent = `KES ${Math.round(monthlyClean)}`;
    document.getElementById("currentBar").style.width = "100%";
    document.getElementById("cleanBar").style.width = `${Math.max(10, Math.round(100 * monthlyClean / monthlyCurrent))}%`;

    // Show results section
    document.getElementById("resultsSection").style.display = "block";
  });
}

function handleFilterChange(e) {
  // Filter stories by fuel type
  const selectedFuel = elements.fuelFilter.value;
  elements.loadingSpinner.style.display = "block";
  elements.storiesFeed.innerHTML = "";
  fetch(`${API_BASE_URL}/stories?fuel_type=${encodeURIComponent(selectedFuel)}`)
    .then(res => res.json())
    .then(data => {
      if (!data.stories || data.stories.length === 0) {
        elements.storiesFeed.innerHTML = '<div class="empty-feed">No stories found.</div>';
      } else {
        elements.storiesFeed.innerHTML = data.stories.map(story => `
          <div class="story-card">
            ${story.image_url ? `<img src="${story.image_url}" alt="Story image" class="story-image">` : ""}
            <div class="story-content">
              <div class="story-header">
                <h3 class="story-title">${escapeHtml(story.title)}</h3>
                <span class="story-meta">By ${escapeHtml(story.author_name)}</span>
              </div>
              <p>${escapeHtml(story.content)}</p>
              <div class="story-meta">
                <span>${story.fuel_type ? escapeHtml(story.fuel_type) : ""}</span>
                <span>${story.location ? escapeHtml(story.location) : ""}</span>
                <span>${story.created_at ? new Date(story.created_at).toLocaleString() : ""}</span>
                <span>Likes: ${story.likes_count || 0}</span>
              </div>
            </div>
          </div>
        `).join("");
      }
    })
    .catch(err => {
      elements.storiesFeed.innerHTML = `<div class=\"error\">Error loading stories: ${err.message}</div>`;
    })
    .finally(() => {
      elements.loadingSpinner.style.display = "none";
    });
}

function loadMoreStories() {
  // Implementation for loading more stories
}

function openModal() {
  // Show add story modal
  elements.addStoryModal.classList.add("active");
  document.body.style.overflow = "hidden";
  setTimeout(() => {
    const titleInput = document.getElementById("storyTitle");
    if (titleInput) titleInput.focus();
  }, 100);
}

function closeModal() {
  // Hide add story modal
  elements.addStoryModal.classList.remove("active");
  document.body.style.overflow = "";
  if (elements.storyForm) elements.storyForm.reset();
  if (elements.charCount) elements.charCount.textContent = "0";
}

function handleStorySubmission(e) {
  e.preventDefault();
  const formData = new FormData(elements.storyForm);
  const submitBtn = elements.submitBtn;
  const btnText = elements.btnText;
  const btnSpinner = elements.btnSpinner;
  // Show loading state
  submitBtn.disabled = true;
  btnText.style.display = "none";
  btnSpinner.style.display = "block";
  fetch(`${API_BASE_URL}/stories`, {
    method: "POST",
    body: formData
  })
    .then(res => {
      if (!res.ok) return res.json().then(data => { throw new Error(data.error || "Failed to add story") });
      return res.json();
    })
    .then(() => {
      showToast("Story shared successfully!");
      closeModal();
      loadStories();
    })
    .catch(err => {
      showToast(err.message, "error");
    })
    .finally(() => {
      submitBtn.disabled = false;
      btnText.style.display = "block";
      btnSpinner.style.display = "none";
    });
}

function updateCharCount(e) {
  // Update character count for story textarea
  const maxLength = 500;
  const currentLength = elements.storyContent.value.length;
  elements.charCount.textContent = currentLength;
  if (currentLength > maxLength * 0.9) {
    elements.charCount.style.color = "#e53e3e";
  } else if (currentLength > maxLength * 0.8) {
    elements.charCount.style.color = "#FF6B35";
  } else {
    elements.charCount.style.color = "#718096";
  }
}

function handleKeyboardNavigation(e) {
  // Implementation for handling keyboard navigation
}

function showToast(message, type = "success") {
  // Implementation for showing toast message
}
