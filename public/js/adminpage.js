// adminpage.js
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) {
    window.location.href = "loginpage.html";
    return;
    }
    // If not teaching_evaluator → redirect to login
    if (user.role_id !== 1 && user.role_id !== 2) {
    localStorage.clear();
    window.location.href = "loginpage.html";
    return;
    }

    // (Optional) check if token expired
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (Date.now() >= payload.exp * 1000) {
    alert("Session expired. Please log in again.");
    localStorage.clear();
    window.location.href = "loginpage.html";
    return;
    }

    // Initialize the page based on user role
    initializePage(user);

    // Sidebar toggle functionality
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    hamburgerBtn.addEventListener('click', function() {
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
        
        // Change icon based on sidebar state
        const icon = this.querySelector('i');
        if (sidebar.classList.contains('show')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    overlay.addEventListener('click', function() {
        sidebar.classList.remove('show');
        this.classList.remove('show');
        hamburgerBtn.querySelector('i').classList.remove('fa-times');
        hamburgerBtn.querySelector('i').classList.add('fa-bars');
    });

    // Navigation functionality
    setupNavigation();

    // Initialize toast
    const saveToast = new bootstrap.Toast(document.getElementById("saveToast"));

    // Save button functionality
    document.getElementById("saveBtn")?.addEventListener("click", () => {
        saveToast.show();
    });

    document.getElementById("saveNonTeachingBtn")?.addEventListener("click", () => {
        saveToast.show();
    });

    // Quick link buttons
    document.getElementById("gotoEvaluation")?.addEventListener("click", (e) => {
        e.preventDefault();
        showSection("evaluation");
        updateActiveLink("evaluationLink");
    });

    document.getElementById("gotoNonTeachingEvaluation")?.addEventListener("click", (e) => {
        e.preventDefault();
        showSection("non-teaching_evaluation");
        updateActiveLink("non-teaching_evaluationLink");
    });

    document.getElementById("gotoPeerEvaluation")?.addEventListener("click", (e) => {
        e.preventDefault();
        showSection("peerEvaluation");
        updateActiveLink("peerEvaluationLink");
    });

    document.getElementById("gotoSummary")?.addEventListener("click", (e) => {
        e.preventDefault();
        showSection("summary");
        updateActiveLink("summaryLink");
    });

    document.getElementById("gotoRanking")?.addEventListener("click", (e) => {
        e.preventDefault();
        showSection("ranking");
        updateActiveLink("rankingLink");
    });

    // Load initial data
    loadDashboardData();
    loadEvaluationData();
    loadNonTeachingEvaluationData();
    loadPeerEvaluationData();
    loadSummaryData();
    loadRankingData();
    loadCertificateData();
    loadEmployeeData();
    loadPeerEvaluationModalData();

    // Save peer assignment
    document.getElementById("savePeerAssignment")?.addEventListener("click", savePeerAssignment);
});

// Initialize page based on user role
function initializePage(user) {
    
    // Apply role-based restrictions
    if (user.role_id === 1) { // Teaching Evaluator
        // Hide non-teaching elements
        document.querySelectorAll(".non-teaching-only").forEach(el => {
            el.style.display = "none";
        });
    } else if (user.role_id === 2) { // Non-Teaching Evaluator
        // Hide teaching elements
        document.querySelectorAll(".teaching-only").forEach(el => {
            el.style.display = "none";
        });
    }
    
    // Set user info
    document.getElementById("userName").textContent = user.name;
    document.getElementById("userRole").textContent = user.role_name;
    document.getElementById("welcomeMessage").textContent = `Welcome back, ${user.name}!`;
    document.getElementById("userDepartment").textContent = `${user.role_name} • ${user.department}`;

}

// Setup navigation between sections
function setupNavigation() {
    const navLinks = document.querySelectorAll(".sidebar-content button");
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const targetId = e.currentTarget.id.replace("Link", "");
            showSection(targetId);
            updateActiveLink(e.currentTarget.id);
        });
    });
}

// Show specific section and hide others
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll(".content-section").forEach(section => {
        section.style.display = "none";
    });
    
    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = "block";
    }
    
    // Close sidebar on mobile
    document.getElementById("sidebar").classList.remove("active");
    document.getElementById("overlay").classList.remove("active");
}

// Update active link in sidebar
function updateActiveLink(activeLinkId) {
    document.querySelectorAll(".sidebar-content button").forEach(link => {
        link.classList.remove("active");
    });
    document.getElementById(activeLinkId).classList.add("active");
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Fetch dashboard data from API
        const response = await fetch("https://testing-server-qtm8.onrender.com/api/dashboard", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Update dashboard statistics
            document.getElementById("handledEmployees").textContent = data.handledEmployees || 0;
            document.getElementById("pendingEvaluations").textContent = data.pendingEvaluations || 0;
            document.getElementById("completedEvaluations").textContent = data.completedEvaluations || 0;
            document.getElementById("pendingCertificates").textContent = data.pendingCertificates || 0;
        } else {
            console.error("Failed to load dashboard data");
        }
    } catch (error) {
        console.error("Error loading dashboard data:", error);
    }
}

// Load evaluation data
async function loadEvaluationData() {
    try {
        const response = await fetch("https://testing-server-qtm8.onrender.com/api/evaluations", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            }
        });
        
        if (response.ok) {
            const evaluations = await response.json();
            const tableBody = document.getElementById("evaluationTableBody");
            
            // Clear existing content
            tableBody.innerHTML = "";
            
            // Populate table with data
            evaluations.forEach(evaluation => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="avatar-sm bg-light rounded-circle me-2 d-flex align-items-center justify-content-center">
                                <i class="fas fa-user text-muted"></i>
                            </div>
                            <div>
                                <div class="fw-bold">${evaluation.employee_name}</div>
                                <small class="text-muted">${evaluation.department}</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="badge ${evaluation.status === 'completed' ? 'bg-success' : evaluation.status === 'draft' ? 'bg-secondary' : 'bg-warning'}">
                            ${evaluation.status}
                        </span>
                    </td>
                    <td>
                        <div class="fw-bold">${evaluation.total_score || 'N/A'}</div>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary"
                            data-bs-toggle="modal" 
                            data-bs-target="#evaluateModal"
                            data-employee="${evaluation.employee_name}">
                            <i class="fas fa-edit me-1"></i> Evaluate
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // Update count
            document.getElementById("evaluationCount").textContent = evaluations.length;
        } else {
            console.error("Failed to load evaluation data");
        }
    } catch (error) {
        console.error("Error loading evaluation data:", error);
    }
}

// Load non-teaching evaluation data
async function loadNonTeachingEvaluationData() {
    try {
        const response = await fetch("https://testing-server-qtm8.onrender.com/api/non-teaching-evaluations", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            }
        });
        
        if (response.ok) {
            const evaluations = await response.json();
            const tableBody = document.getElementById("nonTeachingTableBody");
            
            // Clear existing content
            tableBody.innerHTML = "";
            
            // Populate table with data
            evaluations.forEach(evaluation => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="avatar-sm bg-light rounded-circle me-2 d-flex align-items-center justify-content-center">
                                <i class="fas fa-user text-muted"></i>
                            </div>
                            <div>
                                <div class="fw-bold">${evaluation.employee_name}</div>
                                <small class="text-muted">${evaluation.department}</small>
                            </div>
                        </div>
                    </td>
                    <td>${evaluation.position}</td>
                    <td>
                        <span class="badge ${evaluation.status === 'completed' ? 'bg-success' : evaluation.status === 'draft' ? 'bg-secondary' : 'bg-warning'}">
                            ${evaluation.status}
                        </span>
                    </td>
                    <td>
                        <div class="fw-bold">${evaluation.total_score || 'N/A'}</div>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-edit me-1"></i> Evaluate
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // Update count
            document.getElementById("nonTeachingCount").textContent = evaluations.length;
        } else {
            console.error("Failed to load non-teaching evaluation data");
        }
    } catch (error) {
        console.error("Error loading non-teaching evaluation data:", error);
    }
}

// Load peer evaluation data
async function loadPeerEvaluationData() {
    try {
        const response = await fetch("https://testing-server-qtm8.onrender.com/api/peer-evaluations", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            }
        });
        
        if (response.ok) {
            const assignments = await response.json();
            const tableBody = document.getElementById("peerEvaluationTableBody");
            
            // Clear existing content
            tableBody.innerHTML = "";
            
            // Populate table with data
            assignments.forEach(assignment => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="avatar-sm bg-light rounded-circle me-2 d-flex align-items-center justify-content-center">
                                <i class="fas fa-user text-muted"></i>
                            </div>
                            <div>
                                <div class="fw-bold">${assignment.employeeName}</div>
                                <small class="text-muted">${assignment.department}</small>
                            </div>
                        </div>
                    </td>
                    <td>${assignment.departmentHead || 'Not assigned'}</td>
                    <td>${assignment.sameDepartmentPeer || 'Not assigned'}</td>
                    <td>${assignment.externalDepartmentPeer || 'Not assigned'}</td>
                    <td>
                        <span class="badge ${assignment.status === 'completed' ? 'bg-success' : assignment.status === 'In Progress' ? 'bg-warning' : 'bg-secondary'}">
                            ${assignment.status}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editPeerAssignment(${assignment.id})">
                            <i class="fas fa-edit"><small>Edit</small></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deletePeerAssignment(${assignment.id})">
                            <i class="fas fa-trash"><small>Delete</small></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // Update count
            document.getElementById("peerEvaluationCount").textContent = assignments.length;
        } else {
            console.error("Failed to load peer evaluation data");
        }
    } catch (error) {
        console.error("Error loading peer evaluation data:", error);
    }
}

// Load data for peer evaluation modal
async function loadPeerEvaluationModalData() {
    try {
        const response = await fetch("https://testing-server-qtm8.onrender.com/api/employees", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            }
        });
        
        if (response.ok) {
            const employees = await response.json();
            const employeeSelect = document.getElementById("employeeToEvaluate");
            const departmentHeadSelect = document.getElementById("departmentHead");
            const sameDepartmentPeerSelect = document.getElementById("sameDepartmentPeer");
            const externalDepartmentPeerSelect = document.getElementById("externalDepartmentPeer");
            
            // Clear existing options
            employeeSelect.innerHTML = '<option value="">Select Employee</option>';
            departmentHeadSelect.innerHTML = '<option value="">Select Department Head</option>';
            sameDepartmentPeerSelect.innerHTML = '<option value="">Select Same Department Peer</option>';
            externalDepartmentPeerSelect.innerHTML = '<option value="">Select External Department Peer</option>';
            
            // Populate dropdowns
            employees.forEach(employee => {
                const option = document.createElement("option");
                option.value = employee.id;
                option.textContent = `${employee.name} - ${employee.department}`;
                
                // Add to employee select
                employeeSelect.appendChild(option.cloneNode(true));
                
                // Add to department head select if they are a department head
                if (employee.role === "Department Head") {
                    departmentHeadSelect.appendChild(option.cloneNode(true));
                }
                
                // Add to same department peer select
                sameDepartmentPeerSelect.appendChild(option.cloneNode(true));
                
                // Add to external department peer select
                externalDepartmentPeerSelect.appendChild(option.cloneNode(true));
            });
        } else {
            console.error("Failed to load employee data for modal");
        }
    } catch (error) {
        console.error("Error loading employee data for modal:", error);
    }
}

// Save peer assignment
async function savePeerAssignment() {
    const form = document.getElementById("assignPeerForm");
    const formData = new FormData(form);
    
    const assignment = {
        employeeId: document.getElementById("employeeToEvaluate").value,
        departmentHeadId: document.getElementById("departmentHead").value,
        sameDepartmentPeerId: document.getElementById("sameDepartmentPeer").value,
        externalDepartmentPeerId: document.getElementById("externalDepartmentPeer").value,
        evaluationPeriod: document.getElementById("peerEvaluationPeriodModal").value
    };
    
    try {
        const response = await fetch("https://testing-server-qtm8.onrender.com/api/peer-evaluations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            },
            body: JSON.stringify(assignment)
        });
        
        if (response.ok) {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById("assignPeerModal"));
            modal.hide();
            
            // Reload peer evaluation data
            loadPeerEvaluationData();
            
            // Show success message
            const toast = new bootstrap.Toast(document.getElementById("saveToast"));
            document.querySelector(".toast-body").textContent = "Peer evaluation assigned successfully!";
            toast.show();
        } else {
            alert("Failed to save peer assignment");
        }
    } catch (error) {
        console.error("Error saving peer assignment:", error);
        alert("Error saving peer assignment");
    }
}

// Edit peer assignment
async function editPeerAssignment(assignmentId) {
    // Fetch assignment details and populate modal
    try {
        const response = await fetch(`https://testing-server-qtm8.onrender.com/api/peer-evaluations/${assignmentId}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            }
        });
        
        if (response.ok) {
            const assignment = await response.json();
            
            // Populate modal with assignment data
            document.getElementById("employeeToEvaluate").value = assignment.employeeId;
            document.getElementById("departmentHead").value = assignment.departmentHeadId;
            document.getElementById("sameDepartmentPeer").value = assignment.sameDepartmentPeerId;
            document.getElementById("externalDepartmentPeer").value = assignment.externalDepartmentPeerId;
            document.getElementById("peerEvaluationPeriodModal").value = assignment.evaluationPeriod;
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById("assignPeerModal"));
            modal.show();
            
            // Change save button to update
            const saveButton = document.getElementById("savePeerAssignment");
            saveButton.textContent = "Update Assignment";
            saveButton.onclick = () => updatePeerAssignment(assignmentId);
        } else {
            console.error("Failed to load assignment details");
        }
    } catch (error) {
        console.error("Error loading assignment details:", error);
    }
}

// Update peer assignment
async function updatePeerAssignment(assignmentId) {
    const formData = new FormData(document.getElementById("assignPeerForm"));
    
    const assignment = {
        employeeId: document.getElementById("employeeToEvaluate").value,
        departmentHeadId: document.getElementById("departmentHead").value,
        sameDepartmentPeerId: document.getElementById("sameDepartmentPeer").value,
        externalDepartmentPeerId: document.getElementById("externalDepartmentPeer").value,
        evaluationPeriod: document.getElementById("peerEvaluationPeriodModal").value
    };
    
    try {
        const response = await fetch(`https://testing-server-qtm8.onrender.com/api/peer-evaluations/${assignmentId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            },
            body: JSON.stringify(assignment)
        });
        
        if (response.ok) {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById("assignPeerModal"));
            modal.hide();
            
            // Reload peer evaluation data
            loadPeerEvaluationData();
            
            // Show success message
            const toast = new bootstrap.Toast(document.getElementById("saveToast"));
            document.querySelector(".toast-body").textContent = "Peer evaluation updated successfully!";
            toast.show();
            
            // Reset save button
            const saveButton = document.getElementById("savePeerAssignment");
            saveButton.textContent = "Save Assignment";
            saveButton.onclick = savePeerAssignment;
        } else {
            alert("Failed to update peer assignment");
        }
    } catch (error) {
        console.error("Error updating peer assignment:", error);
        alert("Error updating peer assignment");
    }
}

// Delete peer assignment
async function deletePeerAssignment(assignmentId) {
    if (confirm("Are you sure you want to delete this peer assignment?")) {
        try {
            const response = await fetch(`https://testing-server-qtm8.onrender.com/api/peer-evaluations/${assignmentId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
                }
            });
            
            if (response.ok) {
                // Reload peer evaluation data
                loadPeerEvaluationData();
                
                // Show success message
                const toast = new bootstrap.Toast(document.getElementById("saveToast"));
                document.querySelector(".toast-body").textContent = "Peer assignment deleted successfully!";
                toast.show();
            } else {
                alert("Failed to delete peer assignment");
            }
        } catch (error) {
            console.error("Error deleting peer assignment:", error);
            alert("Error deleting peer assignment");
        }
    }
}

// Other data loading functions (summary, ranking, certificate, employee)
async function loadSummaryData() {
    const response = await fetch("https://testing-server-qtm8.onrender.com/api/summary", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            }
        });

        const tableBody = document.getElementById("summaryTableBody");

        if (response.ok) {
            const summaries = await response.json();
            if (summaries && tableBody) {
                tableBody.innerHTML = "";
            
            summaries.forEach(summary => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar-sm bg-light rounded-circle me-2 d-flex align-items-center justify-content-center">
                            <i class="fas fa-user text-muted"></i>
                        </div>
                        <div>
                            <div class="fw-bold">${summary.employee_name}</div>
                            <small class="text-muted">${summary.department}</small>
                        </div>
                    </div>
                    </td>
                    <td>${summary.total_score || 'N/A'}</td>
                    <td>
                        <span class="badge ${summary.status === 'completed' ? 'bg-success' : summary.status === 'draft' ? 'bg-warning' : 'bg-secondary'}">
                            ${summary.status || 'Not Started'}
                        </span>
                    </td>
                    <td>
                        <div class="btn-outline-group btn-group-sm">
                            <button class="btn btn-sm btn-outline-primary view-report-btn" data-bs-toggle="modal" data-bs-target="#reportModal">
                                <i class="fas fa-eye me-1"></i> View
                            </button>
                            <button class="btn btn-sm btn-outline-secondary">
                                <i class="fas fa-file-pdf me-1"></i> PDF
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            document.getElementById("summaryCount").textContent = summaries.length;
        }
    }
}
async function loadRankingData() {

    const response = await fetch("https://testing-server-qtm8.onrender.com/api/rankings", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            }
        });

    const tableBody = document.getElementById("rankingTableBody");

    if (response.ok) {
        const rankings = await response.json();
            if (rankings && tableBody) {
                tableBody.innerHTML = "";
            
            rankings.forEach(ranking => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="avatar-sm bg-light rounded-circle me-2 d-flex align-items-center justify-content-center">
                                <i class="fas fa-user text-muted"></i>
                            </div>
                            <div>
                                <div class="fw-bold">${ranking.employee_name}</div>
                                <small class="text-muted">${ranking.department}</small>
                            </div>
                        </div>
                    </td>
                    <td>${ranking.total_score}</td>
                    <td>
                        <span class="badge ${ranking.promotion_eligibility === 1 ? 'bg-success' : 'bg-warning'}">
                            ${ranking.promotion_eligibility === 1 ? 'Eligible' : 'Not Eligible'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-employee-history" 
                                data-employee="${ranking.employee_nname}">
                            <i class="fas fa-history me-1"></i> History
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            document.getElementById("rankingCount").textContent = rankings.length;
            
            // Add event listeners to history buttons
            document.querySelectorAll(".view-employee-history").forEach(btn => {
                btn.addEventListener("click", function() {
                    const employeeName = this.getAttribute("data-employee");
                    document.getElementById("historyEmployeeName").textContent = employeeName;
                });
            });
        }
    }
}

async function loadCertificateData() {

    const response = await fetch("https://testing-server-qtm8.onrender.com/api/certificates", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            }
        });

    const tableBody = document.getElementById("certificateTableBody");

    if (response.ok) {
        const certificates = await response.json();
            if (certificates && tableBody) {
                tableBody.innerHTML = "";
            
            certificates.forEach(certificate => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="avatar-sm bg-light rounded-circle me-2 d-flex align-items-center justify-content-center">
                                <i class="fas fa-user text-muted"></i>
                            </div>
                            <div>
                                <div class="fw-bold">${certificate.employee_name}</div>
                                <small class="text-muted">${certificate.department}</small>
                            </div>
                        </div>
                    </td>
                    <td>${certificate.certificate_type}</td>
                    <td>${certificate.certificate_name}</td>
                    <td>${new Date(certificate.date_received).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-certificate"
                                data-bs-toggle="modal" 
                                data-bs-target="#certificateViewModal" 
                                data-employee="${certificate.employee_name}"
                                data-type="${certificate.certificate_type}"
                                data-event="${certificate.certificate_name}"
                                data-date="${certificate.date_received}">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                    <td>
                        <span class="badge ${certificate.status === 'accepted' ? 'bg-success' : certificate.status === 'rejected' ? 'bg-danger' : 'bg-warning'}">
                            ${certificate.status}
                        </span>
                    </td>
                    <td>
                        <div class="btn-outline-group btn-group-sm">
                            <button class="btn btn-sm btn-outline-success accept-certificate" data-certificate-id="${certificate.certificate_id}">
                                <i class="fas fa-check"></i> Accept
                            </button>
                            <button class="btn btn-sm btn-outline-danger reject-certificate" data-certificate-id="${certificate.certificate_id}">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            document.getElementById("certificateCount").textContent = certificates.length;
            
            // Add event listeners to certificate actions
            document.querySelectorAll(".accept-certificate").forEach(btn => {
                btn.addEventListener("click", function() {
                    const certificateId = this.getAttribute("data-certificate-id");
                    updateCertificateStatus(certificateId, 'approved');
                });
            });
            
            document.querySelectorAll(".reject-certificate").forEach(btn => {
                btn.addEventListener("click", function() {
                    const certificateId = this.getAttribute("data-certificate-id");
                    updateCertificateStatus(certificateId, 'rejected');
                });
            });
            
            document.querySelectorAll(".view-certificate").forEach(btn => {
                btn.addEventListener("click", function() {
                    const employeeName = this.getAttribute("data-employee");
                    const certType = this.getAttribute("data-type");
                    const eventName = this.getAttribute("data-event");
                    const certDate = this.getAttribute("data-date");
                    
                    document.getElementById("certEmployeeName").textContent = employeeName;
                    document.getElementById("certType").textContent = certType;
                    document.getElementById("certEventName").textContent = eventName;
                    document.getElementById("certDate").textContent = new Date(certDate).toLocaleDateString();
                });
            });
        }
    }
}

async function updateCertificateStatus(certificateId, status) {
    const result = await fetch(`https://testing-server-qtm8.onrender.com/api/certificates/${certificateId}/status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: status })
    });

    if (result) {
        // Reload certificate data
        loadCertificateData();
        
        // Show success message
        const toast = new bootstrap.Toast(document.getElementById("saveToast"));
        document.querySelector(".toast-body").textContent = `Certificate ${status} successfully!`;
        toast.show();
    } else {
        alert(`Failed to ${status} certificate`);
    }
}


async function loadEmployeeData() {

    const response = await fetch("https://testing-server-qtm8.onrender.com/api/employees-management", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            }
        });

    const tableBody = document.getElementById("employeeTableBody");

    if (response.ok && tableBody) {
        const employees = await response.json();
        tableBody.innerHTML = "";
        
        employees.forEach((employee) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                            <div class="avatar-sm bg-light rounded-circle me-2 d-flex align-items-center justify-content-center">
                                <i class="fas fa-user text-muted"></i>
                            </div>
                            <div>
                                <div class="fw-bold">${employee.name}</div>
                                <small class="text-muted">${employee.department}</small>
                            </div>
                        </div>
                </td>
                <td>${employee.department}</td>
                <td><span class="employment-type type-${employee.employmentType.toLowerCase()}">${employee.employmentType}</span></td>
                <td><span class="employee-status status-${employee.status.toLowerCase()}">${employee.status}</span></td>
                <td>
                    <div class="btn-outline-group btn-group-sm">
                        <button class="btn btn-outline-primary edit-employee"
                                data-bs-toggle="modal" 
                                data-bs-target="#editEmployeeModal" 
                                data-id="${employee.id}"
                                data-name="${employee.name}"
                                data-department="${employee.department}"
                                data-type="${employee.employmentType}"
                                data-status="${employee.status}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-outline-danger archive-employee" data-id="${employee.id}">
                            <i class="fas fa-archive"></i> Archive
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        document.getElementById("employeeCount").textContent = employees.length;
        
        // Add event listeners to employee actions
        document.querySelectorAll(".edit-employee").forEach(btn => {
            btn.addEventListener("click", function() {
                const employeeId = this.getAttribute("data-id");
                const employeeName = this.getAttribute("data-name");
                const department = this.getAttribute("data-department");
                const employmentType = this.getAttribute("data-type");
                const status = this.getAttribute("data-status");
                
                // Populate edit modal
                document.getElementById("editEmployeeId").value = employeeId;
                document.getElementById("editEmployeeName").value = employeeName;
                document.getElementById("editEmployeeDepartment").value = department;
                document.getElementById("editEmployeeType").value = employmentType;
                document.getElementById("editEmployeeStatus").checked = status === 'Active';
            });
        });
        
        document.querySelectorAll(".archive-employee").forEach(btn => {
            btn.addEventListener("click", function() {
                const employeeId = this.getAttribute("data-id");
                if (confirm("Are you sure you want to archive this employee?")) {
                    // Implement archive functionality
                    console.log("Archive employee:", employeeId);
                }
            });
        });
    }
}


// Search functionality
document.addEventListener("DOMContentLoaded", function() {
    // Evaluation search
    document.getElementById("evaluationSearch")?.addEventListener("input", function() {
        const searchText = this.value.toLowerCase();
        const rows = document.querySelectorAll('#evaluationTableBody tr');
        
        rows.forEach(row => {
            const employeeName = row.querySelector('td:first-child').textContent.toLowerCase();
            if (employeeName.includes(searchText)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Non-teaching evaluation search
    document.getElementById("nonTeachingEvaluationSearch")?.addEventListener("input", function() {
        const searchText = this.value.toLowerCase();
        const rows = document.querySelectorAll('#nonTeachingTableBody tr');
        
        rows.forEach(row => {
            const employeeName = row.querySelector('td:first-child').textContent.toLowerCase();
            if (employeeName.includes(searchText)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Peer evaluation search
    document.getElementById("peerEvaluationSearch")?.addEventListener("input", function() {
        const searchText = this.value.toLowerCase();
        const rows = document.querySelectorAll('#peerEvaluationTableBody tr');
        
        rows.forEach(row => {
            const employeeName = row.querySelector('td:first-child').textContent.toLowerCase();
            if (employeeName.includes(searchText)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Summary search
    document.getElementById("summarySearch")?.addEventListener("input", function() {
        const searchText = this.value.toLowerCase();
        const rows = document.querySelectorAll('#summaryTableBody tr');
        
        rows.forEach(row => {
            const employeeName = row.querySelector('td:first-child').textContent.toLowerCase();
            if (employeeName.includes(searchText)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Ranking search
    document.getElementById("rankingSearch")?.addEventListener("input", function() {
        const searchText = this.value.toLowerCase();
        const rows = document.querySelectorAll('#rankingTableBody tr');
        
        rows.forEach(row => {
            const employeeName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            if (employeeName.includes(searchText)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Certificate search
    document.getElementById("certificateSearch")?.addEventListener("input", function() {
        const searchText = this.value.toLowerCase();
        const rows = document.querySelectorAll('#certificateTableBody tr');
        
        rows.forEach(row => {
            const employeeName = row.querySelector('td:first-child').textContent.toLowerCase();
            if (employeeName.includes(searchText)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Employee search
    document.getElementById("employeeSearch")?.addEventListener("input", function() {
        const searchText = this.value.toLowerCase();
        const rows = document.querySelectorAll('#employeeTableBody tr');
        
        rows.forEach(row => {
            const employeeName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            if (employeeName.includes(searchText)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    // Clear localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Redirect to login
    window.location.href = "loginpage.html";
});