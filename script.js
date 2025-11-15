// API Configuration
const API_CONFIG = {
    // Temporarily using working test endpoint until Pipedream workflow is complete
    PIPEDREAM_ENDPOINT: 'https://httpbin.org/post', // Working test endpoint
    REAL_PIPEDREAM_ENDPOINT: 'https://eoqg8odwa0fnqnn.m.pipedream.net', // Your actual webhook URL
    FEE_API_ENDPOINT: 'https://jsonplaceholder.typicode.com/posts/1', // Mock API for demo
    TIMEOUT: 10000, // 10 seconds timeout
    RETRY_ATTEMPTS: 3,
    USE_TEST_MODE: true // Using test mode until Pipedream workflow is complete
};

// Fee data (mock data for demonstration)
const FEE_DATA = {
    'mit-university.html': {
        'B.Tech Computer Science': '₹2,50,000 - ₹3,00,000 per year',
        'B.Tech Mechanical': '₹2,25,000 - ₹2,75,000 per year',
        'B.Tech Electrical': '₹2,25,000 - ₹2,75,000 per year',
        'B.Tech Civil': '₹2,00,000 - ₹2,50,000 per year',
        'MBA': '₹4,50,000 - ₹5,50,000 per year',
        'M.Tech': '₹1,75,000 - ₹2,25,000 per year'
    },
    'stanford-university.html': {
        'Computer Science': '$55,000 - $65,000 per year',
        'Business Administration': '$75,000 - $85,000 per year',
        'Engineering': '$50,000 - $60,000 per year',
        'Data Science': '$60,000 - $70,000 per year',
        'AI & Machine Learning': '$65,000 - $75,000 per year',
        'Entrepreneurship': '$70,000 - $80,000 per year'
    }
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeForm();
    setupSmoothScrolling();
});

// Initialize form functionality
function initializeForm() {
    const form = document.getElementById('leadForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Phone number validation
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            // Remove non-digits
            let value = e.target.value.replace(/\D/g, '');
            // Limit to 10 digits
            if (value.length > 10) {
                value = value.slice(0, 10);
            }
            e.target.value = value;
        });
    }
}

// Handle form submission with retry logic
async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Add university info based on current page
    data.university = getCurrentUniversity();
    data.timestamp = new Date().toISOString();
    data.source = 'University Landing Page';
    data.userAgent = navigator.userAgent;
    data.referrer = document.referrer;

    // Validate form
    if (!validateForm(data)) {
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {
        // Submit to Pipedream with retry logic
        const response = await submitWithRetry(data);

        if (response.success) {
            showMessage('Application submitted successfully! We will contact you soon.', 'success');
            e.target.reset();

            // Track successful submission
            trackEvent('form_submit_success', {
                university: data.university,
                course: data.course
            });
        } else {
            throw new Error(response.error || 'Submission failed');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showMessage('There was an error submitting your application. Please try again.', 'error');

        // Track failed submission
        trackEvent('form_submit_error', {
            university: data.university,
            error: error.message
        });
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Submit with retry logic
async function submitWithRetry(data, attempt = 1) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        const response = await fetch(API_CONFIG.PIPEDREAM_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(data),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const result = await response.json();
            return { success: true, data: result };
        } else if (response.status >= 500 && attempt < API_CONFIG.RETRY_ATTEMPTS) {
            // Retry on server errors
            console.log(`Attempt ${attempt} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
            return submitWithRetry(data, attempt + 1);
        } else {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText}. Response: ${errorText}`);
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout. Please check your connection and try again.');
        } else if (attempt < API_CONFIG.RETRY_ATTEMPTS && !error.message.includes('HTTP 4')) {
            // Retry on network errors, but not on client errors (4xx)
            console.log(`Attempt ${attempt} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            return submitWithRetry(data, attempt + 1);
        } else {
            throw error;
        }
    }
}

// Simple event tracking function
function trackEvent(eventName, properties = {}) {
    console.log('Event:', eventName, properties);
    // In production, you'd send this to your analytics service
    // Example: gtag('event', eventName, properties);
}

// Validate form data
function validateForm(data) {
    // Check required fields
    const requiredFields = ['fullName', 'email', 'phone', 'state', 'course', 'intake'];
    for (let field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showMessage(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`, 'error');
            return false;
        }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showMessage('Please enter a valid email address.', 'error');
        return false;
    }

    // Validate phone (10 digits)
    if (data.phone.length !== 10) {
        showMessage('Please enter a valid 10-digit phone number.', 'error');
        return false;
    }

    // Check consent
    if (!data.consent) {
        showMessage('Please agree to receive information to proceed.', 'error');
        return false;
    }

    return true;
}

// Show form message
function showMessage(message, type) {
    const messageDiv = document.getElementById('formMessage');
    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;
    messageDiv.style.display = 'block';

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

// Get current university from page
function getCurrentUniversity() {
    const title = document.title;
    if (title.includes('MIT')) {
        return 'MIT University';
    } else if (title.includes('Stanford')) {
        return 'Stanford University';
    }
    return 'Unknown University';
}

// Open fee modal
function openFeeModal() {
    const modal = document.getElementById('feeModal');
    const feeContent = document.getElementById('feeContent');

    modal.style.display = 'block';
    feeContent.innerHTML = '<div class="loading">Loading fee details...</div>';

    // Simulate API call and load fee data
    setTimeout(() => {
        loadFeeData();
    }, 1000);
}

// Close fee modal
function closeFeeModal() {
    const modal = document.getElementById('feeModal');
    modal.style.display = 'none';
}

// Load fee data into modal
function loadFeeData() {
    const feeContent = document.getElementById('feeContent');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    let feeData;
    if (currentPage.includes('mit')) {
        feeData = FEE_DATA['mit-university.html'];
    } else if (currentPage.includes('stanford')) {
        feeData = FEE_DATA['stanford-university.html'];
    } else {
        // Default to MIT data
        feeData = FEE_DATA['mit-university.html'];
    }

    let feeHTML = '<table class="fee-table"><thead><tr><th>Course</th><th>Annual Fee</th></tr></thead><tbody>';

    for (const [course, fee] of Object.entries(feeData)) {
        feeHTML += `<tr><td>${course}</td><td>${fee}</td></tr>`;
    }

    feeHTML += '</tbody></table>';
    feeHTML += '<p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">* Fees are subject to change. Contact admissions for the latest information.</p>';

    feeContent.innerHTML = feeHTML;
}

// Download brochure
function downloadBrochure() {
    const university = getCurrentUniversity();

    // Create a simple text file as brochure (in real scenario, this would be a PDF)
    const brochureContent = `
${university} - Information Brochure

Welcome to ${university}!

This is a sample brochure download. In a real implementation, 
this would download an actual PDF brochure with detailed 
information about courses, facilities, and admission procedures.

For more information, please contact our admissions office.

Thank you for your interest in ${university}!
    `;

    const blob = new Blob([brochureContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${university.replace(/\s+/g, '-')}-Brochure.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showMessage('Brochure downloaded successfully!', 'success');
}

// Scroll to form
function scrollToForm() {
    const formSection = document.getElementById('apply');
    if (formSection) {
        formSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Setup smooth scrolling for navigation links
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Close modal when clicking outside
window.addEventListener('click', function (e) {
    const modal = document.getElementById('feeModal');
    if (e.target === modal) {
        closeFeeModal();
    }
});

// API Functions for demonstration
async function fetchFromAPI(endpoint) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API fetch error:', error);
        return null;
    }
}

// Simple API endpoint simulation
function createSimpleAPI() {
    return {
        universities: [
            {
                id: 1,
                name: "MIT University",
                location: "Mumbai, India",
                established: 1985,
                ranking: "Top 10 in India"
            },
            {
                id: 2,
                name: "Stanford University",
                location: "California, USA",
                established: 1885,
                ranking: "#2 Globally"
            }
        ],
        courses: {
            1: [
                { name: "B.Tech Computer Science", duration: "4 years", fee: "₹2,50,000" },
                { name: "MBA", duration: "2 years", fee: "₹4,50,000" }
            ],
            2: [
                { name: "Computer Science", duration: "4 years", fee: "$55,000" },
                { name: "Business Administration", duration: "2 years", fee: "$75,000" }
            ]
        }
    };
}

// Nested JSON API response example
function getNestedUniversityData() {
    return {
        status: "success",
        data: {
            universities: [
                {
                    id: 1,
                    name: "MIT University",
                    details: {
                        location: {
                            city: "Mumbai",
                            state: "Maharashtra",
                            country: "India"
                        },
                        stats: {
                            students: 15000,
                            faculty: 800,
                            placement_rate: 95
                        },
                        courses: [
                            {
                                department: "Engineering",
                                programs: [
                                    {
                                        name: "B.Tech Computer Science",
                                        duration: 4,
                                        fee: {
                                            amount: 250000,
                                            currency: "INR",
                                            per: "year"
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    };
}

// Console log for testing APIs
console.log('Simple API Data:', createSimpleAPI());
console.log('Nested API Data:', getNestedUniversityData());