import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [showStudentLogin, setShowStudentLogin] = useState(false);
  const [showHodLogin, setShowHodLogin] = useState(false);
  const [showComplaint, setShowComplaint] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [studentLoggedIn, setStudentLoggedIn] = useState(false);
  const [hodLoggedIn, setHodLoggedIn] = useState(false);

  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");

  const [trackedComplaint, setTrackedComplaint] = useState(null);

  // NEW: stores the complaint ID of the complaint just submitted
  const [submittedComplaintId, setSubmittedComplaintId] = useState("");

  const [complaints, setComplaints] = useState(() => {
    try {
      const saved = localStorage.getItem("studentVoiceComplaints");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    department: "",
    semester: "",
    category: "",
    details: "",
    anonymous: false,
  });

  const [responseText, setResponseText] = useState({});

  // SAVE COMPLAINTS
  useEffect(() => {
    localStorage.setItem(
      "studentVoiceComplaints",
      JSON.stringify(complaints)
    );
  }, [complaints]);

  // SCROLL
  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // =========================
  // STUDENT LOGIN
  // =========================
  const handleStudentLogin = (e) => {
    e.preventDefault();

    const id = e.target.studentId.value.trim();
    const password = e.target.password.value.trim();

    if (!id || !password) {
      alert("Please enter Student ID and Password.");
      return;
    }

    setStudentId(id);
    setStudentName(id);

    setStudentLoggedIn(true);
    setHodLoggedIn(false);
    setShowStudentLogin(false);

    setTimeout(() => {
      scrollToSection("student-dashboard");
    }, 100);

    alert("Student login successful!");
  };

  // =========================
  // HOD LOGIN
  // =========================
  const handleHodLogin = (e) => {
    e.preventDefault();

    const username = e.target.username.value.trim();
    const password = e.target.password.value.trim();

    if (!username || !password) {
      alert("Please enter Username and Password.");
      return;
    }

    setHodLoggedIn(true);
    setStudentLoggedIn(false);
    setShowHodLogin(false);

    setTimeout(() => {
      scrollToSection("hod-dashboard");
    }, 100);

    alert("HOD login successful!");
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    setStudentLoggedIn(false);
    setHodLoggedIn(false);
    setStudentId("");
    setStudentName("");
    setTrackedComplaint(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // FORM CHANGE
  // =========================
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================
  // SUBMIT COMPLAINT
  // =========================
  const handleComplaintSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.studentId ||
      !formData.department ||
      !formData.semester ||
      !formData.category ||
      !formData.details
    ) {
      alert("Please fill all required fields.");
      return;
    }

    // Generate unique complaint ID
    const complaintId = `CMP-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const newComplaint = {
      id: complaintId,
      name: formData.name,
      studentId: formData.studentId,
      department: formData.department,
      semester: formData.semester,
      category: formData.category,
      details: formData.details,
      anonymous: formData.anonymous,
      status: "Pending",
      response: "",
      date: new Date().toLocaleDateString(),
    };

    // Save complaint
    setComplaints((previous) => [newComplaint, ...previous]);

    // IMPORTANT:
    // Store the exact ID of the newly submitted complaint
    setSubmittedComplaintId(complaintId);

    // Reset form
    setFormData({
      name: "",
      studentId: "",
      department: "",
      semester: "",
      category: "",
      details: "",
      anonymous: false,
    });

    // Close complaint form
    setShowComplaint(false);

    // Show success screen
    setShowSuccess(true);

    // Keep success screen visible for 8 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 8000);

    // Also show alert
    alert(
      `Complaint submitted successfully!\n\nYour Complaint ID: ${complaintId}\n\nPlease save this ID for tracking.`
    );
  };

  // =========================
  // COPY COMPLAINT ID
  // =========================
  const copyComplaintId = async () => {
    if (!submittedComplaintId) return;

    try {
      await navigator.clipboard.writeText(submittedComplaintId);
      alert("Complaint ID copied successfully!");
    } catch {
      alert(`Please copy your Complaint ID manually:\n${submittedComplaintId}`);
    }
  };

  // =========================
  // TRACK COMPLAINT
  // =========================
  const handleTrackComplaint = (e) => {
    e.preventDefault();

    const id = e.target.complaintId.value.trim();

    if (!id) {
      alert("Please enter a Complaint ID.");
      return;
    }

    const found = complaints.find(
      (complaint) => complaint.id.toLowerCase() === id.toLowerCase()
    );

    if (!found) {
      setTrackedComplaint(null);
      alert("Complaint not found. Please enter a valid Complaint ID.");
      return;
    }

    setTrackedComplaint(found);
  };

  // =========================
  // HOD RESPONSE
  // =========================
  const handleResponseChange = (id, value) => {
    setResponseText((previous) => ({
      ...previous,
      [id]: value,
    }));
  };

  const sendHodResponse = (id) => {
    const message = responseText[id]?.trim();

    if (!message) {
      alert("Please write a response before sending.");
      return;
    }

    setComplaints((previous) =>
      previous.map((complaint) =>
        complaint.id === id
          ? {
              ...complaint,
              response: message,
              status:
                complaint.status === "Pending"
                  ? "In Progress"
                  : complaint.status,
            }
          : complaint
      )
    );

    setResponseText((previous) => ({
      ...previous,
      [id]: "",
    }));

    if (trackedComplaint?.id === id) {
      setTrackedComplaint((previous) => ({
        ...previous,
        response: message,
        status:
          previous.status === "Pending"
            ? "In Progress"
            : previous.status,
      }));
    }

    alert("Response sent successfully!");
  };

  // =========================
  // UPDATE STATUS
  // =========================
  const updateComplaintStatus = (id, newStatus) => {
    setComplaints((previous) =>
      previous.map((complaint) =>
        complaint.id === id
          ? {
              ...complaint,
              status: newStatus,
            }
          : complaint
      )
    );

    if (trackedComplaint?.id === id) {
      setTrackedComplaint((previous) => ({
        ...previous,
        status: newStatus,
      }));
    }
  };

  // =========================
  // STUDENT COMPLAINTS
  // =========================
  const myComplaints = complaints.filter(
    (complaint) => complaint.studentId === studentId
  );

  const pendingCount = myComplaints.filter(
    (complaint) => complaint.status === "Pending"
  ).length;

  const progressCount = myComplaints.filter(
    (complaint) => complaint.status === "In Progress"
  ).length;

  const resolvedCount = myComplaints.filter(
    (complaint) => complaint.status === "Resolved"
  ).length;

  // =========================
  // STATUS CLASS
  // =========================
  const getStatusClass = (status) => {
    if (status === "Pending") return "status-pending";
    if (status === "In Progress") return "status-progress";
    if (status === "Resolved") return "status-resolved";

    return "";
  };

  return (
    <div className="app">

      {/* =========================
          NAVBAR
      ========================= */}
      <header className="navbar">
        <div
          className="logo"
          onClick={() => scrollToSection("home")}
        >
          Student<span>Voice</span>
        </div>

        <nav>
          <button onClick={() => scrollToSection("home")}>
            Home
          </button>

          <button onClick={() => scrollToSection("about")}>
            About
          </button>

          <button onClick={() => scrollToSection("how-it-works")}>
            How It Works
          </button>

          <button onClick={() => scrollToSection("track")}>
            Track
          </button>

          <button onClick={() => scrollToSection("contact")}>
            Contact
          </button>
        </nav>

        <div className="nav-buttons">

          {!studentLoggedIn && !hodLoggedIn && (
            <>
              <button
                className="login-btn"
                onClick={() => setShowStudentLogin(true)}
              >
                Student Login
              </button>

              <button
                className="hod-btn"
                onClick={() => setShowHodLogin(true)}
              >
                HOD Login
              </button>
            </>
          )}

          {studentLoggedIn && (
            <>
              <button
                className="dashboard-btn"
                onClick={() =>
                  scrollToSection("student-dashboard")
                }
              >
                Dashboard
              </button>

              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}

          {hodLoggedIn && (
            <>
              <button
                className="dashboard-btn"
                onClick={() =>
                  scrollToSection("hod-dashboard")
                }
              >
                HOD Dashboard
              </button>

              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      {/* =========================
          HERO
      ========================= */}
      <section id="home" className="hero">

        <div className="hero-content">

          <p className="hero-label">
            DIRECT STUDENT COMPLAINT SYSTEM
          </p>

          <h1>
            Your Voice.
            <br />
            <span>Your Right.</span>
          </h1>

          <p className="hero-description">
            Submit your complaint directly to the HOD.
            No unnecessary middle steps. No hesitation.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-btn"
              onClick={() => {
                if (!studentLoggedIn) {
                  setShowStudentLogin(true);
                } else {
                  setShowComplaint(true);
                }
              }}
            >
              Submit Complaint
            </button>

            <button
              className="secondary-btn"
              onClick={() => scrollToSection("track")}
            >
              Track Complaint
            </button>

          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-icon">✓</div>

          <h3>Direct to HOD</h3>

          <p>
            Your complaint goes directly to the department head.
          </p>
        </div>

      </section>

      {/* =========================
          FEATURES
      ========================= */}
      <section className="features">

        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Private & Secure</h3>
          <p>
            Your complaint details remain protected.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Direct Submission</h3>
          <p>
            Send complaints directly to the HOD.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Track Progress</h3>
          <p>
            Check your complaint status anytime.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">💬</div>
          <h3>HOD Response</h3>
          <p>
            Receive updates about your complaint.
          </p>
        </div>

      </section>

      {/* =========================
          ABOUT
      ========================= */}
      <section id="about" className="about section">

        <div className="section-heading">
          <p>ABOUT STUDENTVOICE</p>

          <h2>
            A better way to <span>be heard.</span>
          </h2>
        </div>

        <div className="about-content">

          <div>

            <p>
              StudentVoice is designed to make the complaint
              process simple, direct and transparent.
            </p>

            <p>
              Students can submit their concerns directly to
              the HOD instead of passing through multiple people.
            </p>

          </div>

          <div className="about-box">
            <h3>Our Goal</h3>

            <p>
              Give every student a safe and direct channel to
              communicate genuine concerns.
            </p>
          </div>

        </div>

      </section>

      {/* =========================
          HOW IT WORKS
      ========================= */}
      <section
        id="how-it-works"
        className="how-it-works section"
      >

        <div className="section-heading">
          <p>HOW IT WORKS</p>

          <h2>
            Simple. <span>Direct. Transparent.</span>
          </h2>
        </div>

        <div className="steps">

          <div className="step">
            <div className="step-number">01</div>
            <h3>Login</h3>
            <p>
              Login using your Student ID.
            </p>
          </div>

          <div className="step">
            <div className="step-number">02</div>
            <h3>Submit</h3>
            <p>
              Describe your complaint clearly.
            </p>
          </div>

          <div className="step">
            <div className="step-number">03</div>
            <h3>HOD Reviews</h3>
            <p>
              The HOD receives and reviews your complaint.
            </p>
          </div>

          <div className="step">
            <div className="step-number">04</div>
            <h3>Track</h3>
            <p>
              Track the progress until resolution.
            </p>
          </div>

        </div>

      </section>

      {/* =========================
          TRACK COMPLAINT
      ========================= */}
      <section id="track" className="track section">

        <div className="section-heading">
          <p>COMPLAINT TRACKING</p>

          <h2>
            Track your <span>complaint.</span>
          </h2>
        </div>

        <form
          className="track-form"
          onSubmit={handleTrackComplaint}
        >

          <input
            name="complaintId"
            type="text"
            placeholder="Enter Complaint ID e.g. CMP-2026-1234"
          />

          <button
            type="submit"
            className="primary-btn"
          >
            Track Complaint
          </button>

        </form>

        {trackedComplaint && (
          <div className="tracking-result">

            <div className="tracking-header">

              <div>
                <p>COMPLAINT ID</p>

                <h3>
                  {trackedComplaint.id}
                </h3>
              </div>

              <span
                className={`status-badge ${getStatusClass(
                  trackedComplaint.status
                )}`}
              >
                {trackedComplaint.status}
              </span>

            </div>

            <div className="tracking-details">

              <p>
                <strong>Category:</strong>{" "}
                {trackedComplaint.category}
              </p>

              <p>
                <strong>Department:</strong>{" "}
                {trackedComplaint.department}
              </p>

              <p>
                <strong>Submitted:</strong>{" "}
                {trackedComplaint.date}
              </p>

            </div>

            <div className="hod-response">

              <h4>HOD Response</h4>

              <p>
                {trackedComplaint.response ||
                  "No response from HOD yet. Your complaint is still waiting for review."}
              </p>

            </div>

          </div>
        )}

      </section>

      {/* =========================
          STUDENT DASHBOARD
      ========================= */}
      {studentLoggedIn && (
        <section
          id="student-dashboard"
          className="student-dashboard section"
        >

          <div className="section-heading">

            <p>STUDENT DASHBOARD</p>

            <h2>
              Welcome, <span>{studentName}</span>
            </h2>

          </div>

          <div className="dashboard-top">

            <button
              className="primary-btn"
              onClick={() => setShowComplaint(true)}
            >
              + New Complaint
            </button>

          </div>

          <div className="dashboard-stats">

            <div className="dashboard-stat">
              <h3>{myComplaints.length}</h3>
              <p>Total Complaints</p>
            </div>

            <div className="dashboard-stat">
              <h3>{pendingCount}</h3>
              <p>Pending</p>
            </div>

            <div className="dashboard-stat">
              <h3>{progressCount}</h3>
              <p>In Progress</p>
            </div>

            <div className="dashboard-stat">
              <h3>{resolvedCount}</h3>
              <p>Resolved</p>
            </div>

          </div>

          <div className="dashboard-list">

            <h3>My Complaints</h3>

            {myComplaints.length === 0 ? (

              <div className="empty-dashboard">

                <div>📭</div>

                <h4>No complaints yet</h4>

                <p>
                  You have not submitted any complaints.
                </p>

                <button
                  className="primary-btn"
                  onClick={() => setShowComplaint(true)}
                >
                  Submit Your First Complaint
                </button>

              </div>

            ) : (

              <div className="complaints-grid">

                {myComplaints.map((complaint) => (

                  <div
                    className="dashboard-complaint-card"
                    key={complaint.id}
                  >

                    <div className="complaint-card-header">

                      <div>
                        <small>Complaint ID</small>

                        <h4>
                          {complaint.id}
                        </h4>
                      </div>

                      <span
                        className={`status-badge ${getStatusClass(
                          complaint.status
                        )}`}
                      >
                        {complaint.status}
                      </span>

                    </div>

                    <p>
                      <strong>Category:</strong>{" "}
                      {complaint.category}
                    </p>

                    <p>
                      <strong>Department:</strong>{" "}
                      {complaint.department}
                    </p>

                    <p className="complaint-preview">
                      {complaint.details}
                    </p>

                    <div className="complaint-response">

                      <strong>HOD Response:</strong>

                      <p>
                        {complaint.response ||
                          "No response yet. Your complaint is waiting for HOD review."}
                      </p>

                    </div>

                    <button
                      className="track-small-btn"
                      onClick={() => {
                        setTrackedComplaint(complaint);
                        scrollToSection("track");
                      }}
                    >
                      View Status
                    </button>

                  </div>

                ))}

              </div>

            )}

          </div>

        </section>
      )}

      {/* =========================
          HOD DASHBOARD
      ========================= */}
      {hodLoggedIn && (
        <section
          id="hod-dashboard"
          className="hod-dashboard section"
        >

          <div className="section-heading">

            <p>HOD DASHBOARD</p>

            <h2>
              Manage <span>Student Complaints</span>
            </h2>

          </div>

          <div className="hod-stats">

            <div className="dashboard-stat">
              <h3>{complaints.length}</h3>
              <p>Total Complaints</p>
            </div>

            <div className="dashboard-stat">

              <h3>
                {
                  complaints.filter(
                    (c) => c.status === "Pending"
                  ).length
                }
              </h3>

              <p>Pending</p>

            </div>

            <div className="dashboard-stat">

              <h3>
                {
                  complaints.filter(
                    (c) => c.status === "In Progress"
                  ).length
                }
              </h3>

              <p>In Progress</p>

            </div>

            <div className="dashboard-stat">

              <h3>
                {
                  complaints.filter(
                    (c) => c.status === "Resolved"
                  ).length
                }
              </h3>

              <p>Resolved</p>

            </div>

          </div>

          <div className="hod-complaints">

            <h3>All Student Complaints</h3>

            {complaints.length === 0 ? (

              <div className="empty-dashboard">

                <div>📭</div>

                <h4>No complaints available</h4>

                <p>
                  Student complaints will appear here.
                </p>

              </div>

            ) : (

              <div className="complaints-grid">

                {complaints.map((complaint) => (

                  <div
                    className="dashboard-complaint-card"
                    key={complaint.id}
                  >

                    <div className="complaint-card-header">

                      <div>

                        <small>Complaint ID</small>

                        <h4>
                          {complaint.id}
                        </h4>

                      </div>

                      <span
                        className={`status-badge ${getStatusClass(
                          complaint.status
                        )}`}
                      >
                        {complaint.status}
                      </span>

                    </div>

                    <p>
                      <strong>Student:</strong>{" "}
                      {complaint.anonymous
                        ? "Anonymous Student"
                        : complaint.name}
                    </p>

                    <p>
                      <strong>Student ID:</strong>{" "}
                      {complaint.studentId}
                    </p>

                    <p>
                      <strong>Department:</strong>{" "}
                      {complaint.department}
                    </p>

                    <p>
                      <strong>Semester:</strong>{" "}
                      {complaint.semester}
                    </p>

                    <p>
                      <strong>Category:</strong>{" "}
                      {complaint.category}
                    </p>

                    <div className="complaint-details">

                      <strong>Complaint:</strong>

                      <p>
                        {complaint.details}
                      </p>

                    </div>

                    {/* HOD RESPONSE */}

                    <div className="hod-response-box">

                      <label>
                        HOD Response
                      </label>

                      <textarea
                        value={
                          responseText[complaint.id] || ""
                        }
                        onChange={(e) =>
                          handleResponseChange(
                            complaint.id,
                            e.target.value
                          )
                        }
                        placeholder={
                          complaint.response
                            ? "Write a new response..."
                            : "Write your response to the student..."
                        }
                      />

                      <button
                        className="send-response-btn"
                        onClick={() =>
                          sendHodResponse(complaint.id)
                        }
                      >
                        Send Response
                      </button>

                    </div>

                    {/* CURRENT RESPONSE */}

                    {complaint.response && (
                      <div className="current-hod-response">

                        <strong>
                          Current Response
                        </strong>

                        <p>
                          {complaint.response}
                        </p>

                      </div>
                    )}

                    {/* STATUS BUTTONS */}

                    <div className="hod-actions">

                      <button
                        className="pending-action"
                        onClick={() =>
                          updateComplaintStatus(
                            complaint.id,
                            "Pending"
                          )
                        }
                      >
                        Pending
                      </button>

                      <button
                        className="progress-action"
                        onClick={() =>
                          updateComplaintStatus(
                            complaint.id,
                            "In Progress"
                          )
                        }
                      >
                        In Progress
                      </button>

                      <button
                        className="resolve-action"
                        onClick={() =>
                          updateComplaintStatus(
                            complaint.id,
                            "Resolved"
                          )
                        }
                      >
                        Resolve
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </section>
      )}

      {/* =========================
          CONTACT
      ========================= */}
      <section
        id="contact"
        className="contact section"
      >

        <div className="section-heading">

          <p>CONTACT</p>

          <h2>
            Need <span>help?</span>
          </h2>

        </div>

        <p>
          If you face any technical issue while using
          StudentVoice, contact your department administration.
        </p>

      </section>

      {/* =========================
          FOOTER
      ========================= */}
      <footer>

        <div className="footer-logo">
          Student<span>Voice</span>
        </div>

        <p>
          A direct complaint platform for students.
        </p>

        <p className="copyright">
          © 2026 StudentVoice. All rights reserved.
        </p>

      </footer>

      {/* =========================
          STUDENT LOGIN
      ========================= */}
      {showStudentLogin && (

        <div
          className="modal-overlay"
          onClick={() => setShowStudentLogin(false)}
        >

          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="close-modal"
              onClick={() => setShowStudentLogin(false)}
            >
              ×
            </button>

            <p className="modal-label">
              STUDENT PORTAL
            </p>

            <h2>
              Student Login
            </h2>

            <form onSubmit={handleStudentLogin}>

              <input
                name="studentId"
                type="text"
                placeholder="Student ID"
              />

              <input
                name="password"
                type="password"
                placeholder="Password"
              />

              <button
                type="submit"
                className="primary-btn full-btn"
              >
                Login
              </button>

            </form>

          </div>

        </div>

      )}

      {/* =========================
          HOD LOGIN
      ========================= */}
      {showHodLogin && (

        <div
          className="modal-overlay"
          onClick={() => setShowHodLogin(false)}
        >

          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="close-modal"
              onClick={() => setShowHodLogin(false)}
            >
              ×
            </button>

            <p className="modal-label">
              ADMINISTRATION
            </p>

            <h2>
              HOD Login
            </h2>

            <form onSubmit={handleHodLogin}>

              <input
                name="username"
                type="text"
                placeholder="Username"
              />

              <input
                name="password"
                type="password"
                placeholder="Password"
              />

              <button
                type="submit"
                className="primary-btn full-btn"
              >
                Login
              </button>

            </form>

          </div>

        </div>

      )}

      {/* =========================
          COMPLAINT MODAL
      ========================= */}
      {showComplaint && (

        <div
          className="modal-overlay"
          onClick={() => setShowComplaint(false)}
        >

          <div
            className="modal complaint-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="close-modal"
              onClick={() => setShowComplaint(false)}
            >
              ×
            </button>

            <p className="modal-label">
              STUDENTVOICE
            </p>

            <h2>
              Submit Complaint
            </h2>

            <form onSubmit={handleComplaintSubmit}>

              <input
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                type="text"
                placeholder="Student Name *"
              />

              <input
                name="studentId"
                value={formData.studentId}
                onChange={handleFormChange}
                type="text"
                placeholder="Student ID *"
              />

              <select
                name="department"
                value={formData.department}
                onChange={handleFormChange}
              >

                <option value="">
                  Select Department *
                </option>

                <option value="Computer Science">
                  Computer Science
                </option>

                <option value="Software Engineering">
                  Software Engineering
                </option>

                <option value="Information Technology">
                  Information Technology
                </option>

                <option value="Electrical Engineering">
                  Electrical Engineering
                </option>

                <option value="Business Administration">
                  Business Administration
                </option>

              </select>

              <select
                name="semester"
                value={formData.semester}
                onChange={handleFormChange}
              >

                <option value="">
                  Select Semester *
                </option>

                <option value="1st Semester">
                  1st Semester
                </option>

                <option value="2nd Semester">
                  2nd Semester
                </option>

                <option value="3rd Semester">
                  3rd Semester
                </option>

                <option value="4th Semester">
                  4th Semester
                </option>

                <option value="5th Semester">
                  5th Semester
                </option>

                <option value="6th Semester">
                  6th Semester
                </option>

                <option value="7th Semester">
                  7th Semester
                </option>

                <option value="8th Semester">
                  8th Semester
                </option>

              </select>

              <select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
              >

                <option value="">
                  Select Complaint Category *
                </option>

                <option value="Academic">
                  Academic
                </option>

                <option value="Teacher">
                  Teacher
                </option>

                <option value="Administration">
                  Administration
                </option>

                <option value="Facilities">
                  Facilities
                </option>

                <option value="Harassment">
                  Harassment
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

              <textarea
                name="details"
                value={formData.details}
                onChange={handleFormChange}
                placeholder="Describe your complaint *"
                rows="5"
              />

              <label className="anonymous-option">

                <input
                  name="anonymous"
                  type="checkbox"
                  checked={formData.anonymous}
                  onChange={handleFormChange}
                />

                Submit anonymously

              </label>

              <button
                type="submit"
                className="primary-btn full-btn"
              >
                Submit Complaint
              </button>

            </form>

          </div>

        </div>

      )}

      {/* =========================
          SUCCESS SCREEN
      ========================= */}
      {showSuccess && (

        <div className="success-overlay">

          <div className="success-box">

            <div className="success-icon">
              ✓
            </div>

            <h2>
              Complaint Submitted!
            </h2>

            <p>
              Your complaint has been successfully submitted
              and is waiting for HOD review.
            </p>

            {/* IMPORTANT: COMPLAINT ID */}

            <div className="success-complaint-id">

              <span>
                YOUR COMPLAINT ID
              </span>

              <strong>
                {submittedComplaintId}
              </strong>

            </div>

            <p className="save-id-message">
              Please save this Complaint ID. You will need it
              to track your complaint.
            </p>

            <button
              className="copy-id-btn"
              onClick={copyComplaintId}
            >
              📋 Copy Complaint ID
            </button>

            <button
              className="close-success-btn"
              onClick={() => setShowSuccess(false)}
            >
              Done
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;
