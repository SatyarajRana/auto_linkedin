import React, { useState, useEffect } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import "./Calendar.css";
import { Sparkles, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { Drawer, Button, Input, Select } from "antd";
import axios from "axios";

var BASE_URL;
const env = process.env.REACT_APP_ENVIRONMENT;
if (env === "production") {
  // Production URL
  BASE_URL = process.env.REACT_APP_PRODUCTION_URL;
} else {
  // Development URL
  BASE_URL = process.env.REACT_APP_DEVELOPMENT_URL;
}

const MAX_CHARS = 3000;

const ContentCalendar = () => {
  const navigate = useNavigate();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [postContent, setPostContent] = useState("");
  const [updatedPostContent, setUpdatedPostContent] = useState("");
  const [isCardOpen, setIsCardOpen] = useState(false);
  // const [userInfo, setUserInfo] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [calendarDataLoaded, setCalendarDataLoaded] = useState(false);
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [editedTopicIdea, setEditedTopicIdea] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  const themes = [
    "Current Trends",
    "Client Questions",
    "Problems you Solved",
    "Your Skills",
  ];

  useEffect(() => {
    const fetchUserInfo = async (token) => {
      console.log("Fetching user info...");

      try {
        const response = await axios.get(`${BASE_URL}/get-calendar-posts`, {
          headers: {
            Authorization: token,
          },
        });
        console.log("User info response:", response.data);
        await setCalendarData(response.data.posts);
        setCalendarDataLoaded(true);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const { response } = error;
          if (response?.status === 403) {
            switch (response.data?.errorType) {
              case "ONBOARDING_INCOMPLETE":
                toast.warning(
                  "Please complete onboarding to access the calendar."
                );
                navigate("/onboarding");
                break;

              case "SUBSCRIPTION_REQUIRED":
                toast.error(
                  "Please subscribe to access the calendar features."
                );
                navigate("/billing");
                break;

              default:
                toast.error("Access denied.");
            }
          } else if (response?.status === 401) {
            toast.error("User not found.");
            navigate("/signin");
          } else {
            toast.error("Unexpected error occurred.");
          }
        } else {
          console.log("This is the error,", error);

          toast.error("error");
        }
      }
    };
    if (!calendarDataLoaded) {
      const token = localStorage.getItem("session_token");
      if (!token) {
        navigate("/signin");
      } else {
        try {
          fetchUserInfo(token);
        } catch (err) {
          console.error("Error fetching user info:", err);
          toast.error("Error fetching user info");
        }
      }
    }
  }, [calendarDataLoaded, navigate]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Published":
        return "status-published";
      case "Scheduled":
        return "status-scheduled";
      case "Writing":
        return "status-writing";
      default:
        return "status-default";
    }
  };

  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(
        prevDate.getFullYear(),
        prevDate.getMonth() - 1,
        1
      );
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(
        prevDate.getFullYear(),
        prevDate.getMonth() + 1,
        1
      );
      return newDate;
    });
  };

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const days = getDaysInMonth(currentYear, currentMonth);
  const monthName = new Date(currentYear, currentMonth).toLocaleString(
    "default",
    { month: "long" }
  );

  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const handleDayClick = (day) => {
    const dateStr = day.toLocaleDateString("en-CA");

    const entry = calendarData.find((e) => e.date === dateStr);
    setSelectedDay(entry || { date: dateStr, topicIdea: "", type: "" });
    setPostContent(entry ? entry.content || "" : "");

    setUpdatedPostContent(entry ? entry.content || "" : "");
    setIsCardOpen(true);
  };

  const handleCloseCard = () => {
    setEditedTopicIdea("");
    setIsEditingTopic(false);
    setIsCardOpen(false);
    setSelectedTheme("");
    setTimeout(() => {
      setSelectedDay(null);
    }, 300); // Delay to allow the drawer to close before resetting selectedDay
  };

  const handlePostContentChange = (e) => {
    // setPostContent(e.target.value);
    setUpdatedPostContent(e.target.value);
  };

  const handleGeneratePost = () => {
    const token = localStorage.getItem("session_token");
    if (!token) {
      toast.error("Session expired. Please sign in again.");
      navigate("/signin");
      return;
    }

    setIsGenerating(true);
    const payload = {
      topicIdea: selectedDay.topicIdea,
      theme: selectedTheme,
    };

    const response = axios.post(`${BASE_URL}/generate_post`, payload, {
      headers: {
        Authorization: token,
      },
    });
    response
      .then((res) => {
        console.log("Generated post content:", res);
        setUpdatedPostContent(res.data.post);
        toast.success("Post generated successfully!");
      })
      .catch((error) => {
        console.error("Error generating post:", error);
        toast.error("Failed to generate post.");
      })
      .finally(() => {
        setIsGenerating(false);
      });
  };

  function getScheduledTime(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);

    // 1) Build a Date in the **local** timezone at midnight
    const date = new Date(year, month - 1, day);

    // 2) Figure out what weekday it is (local)
    const dow = date.getDay(); // 0=Sun,1=Mon,2=Tue,3=Wed...

    // 3) Pick the local hour
    let hour;
    if (dow === 1) hour = 9; // Monday → 9 AM local
    else if (dow === 3) hour = 11; // Wednesday → 11 AM local
    else if (dow === 5) hour = 15; // Friday →  3 PM local
    else hour = 12; // fallback noon

    // 4) Set *local* hours
    date.setHours(hour, 0, 0, 0);

    // 5) Return an ISO string (always UTC under the hood)
    return date.toISOString();
  }

  const handleSchedulePost = async () => {
    if (!selectedDay) {
      toast.error("No date selected.");
      return;
    }

    const token = localStorage.getItem("session_token");
    if (!token) {
      toast.error("Session expired. Please sign in again.");
      navigate("/signin");
      return;
    }

    setIsScheduling(true);

    const scheduledTime = getScheduledTime(selectedDay.date);

    const payload = {
      date: selectedDay.date,
      postContent: updatedPostContent,
      scheduledTime: scheduledTime,
      topicIdea: selectedDay.topicIdea,
    };

    try {
      await axios.post(`${BASE_URL}/schedule_post`, payload, {
        headers: {
          Authorization: token,
        },
      });
      toast.success(
        `Post scheduled for ${new Date(scheduledTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })} UTC!`
      );

      // Update calendar UI (optional)
      const updatedData = calendarData.map((post) =>
        post.date === selectedDay.date
          ? { ...post, postContent: updatedPostContent, status: "Scheduled" }
          : post
      );
      setCalendarData(updatedData);
      setIsScheduling(false);
      setTimeout(() => {
        setIsCardOpen(false);
      }, 300); // Delay to allow the drawer to close before resetting selectedDay
    } catch (error) {
      console.error("Error scheduling post:", error);
      toast.error("Failed to schedule post.");
    }
  };

  const handleCancelPost = () => {
    if (!selectedDay) {
      toast.error("No date selected.");
      return;
    }

    const token = localStorage.getItem("session_token");
    if (!token) {
      toast.error("Session expired. Please sign in again.");
      navigate("/signin");
      return;
    }

    const payload = {
      date: selectedDay.date,
    };

    axios
      .post(`${BASE_URL}/cancel_post`, payload, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        const updatedData = calendarData.map((post) =>
          post.date === selectedDay.date
            ? { ...post, postContent: postContent, status: "Cancelled" }
            : post
        );
        setCalendarData(updatedData);
        console.log("Post cancelled successfully:", response.data);
        toast.success("Post cancelled successfully!");
        setIsCardOpen(false);
      })
      .catch((error) => {
        console.error("Error cancelling post:", error);
        toast.error("Failed to cancel post.");
      });
  };

  const handleDeletePost = () => {
    if (!selectedDay) {
      toast.error("No date selected.");
      return;
    }

    const token = localStorage.getItem("session_token");
    if (!token) {
      toast.error("Session expired. Please sign in again.");
      navigate("/signin");
      return;
    }

    const payload = {
      date: selectedDay.date,
    };

    axios
      .post(`${BASE_URL}/delete_post`, payload, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        const updatedData = calendarData.map((post) =>
          post.date === selectedDay.date
            ? { ...post, postContent: "", status: "", topicIdea: "" }
            : post
        );
        setCalendarData(updatedData);
        console.log("Post deleted successfully:", response.data);
        toast.success("Post deleted successfully!");
        setIsCardOpen(false);
      })
      .catch((error) => {
        console.error("Error deleting post:", error);
        toast.error("Failed to delete post.");
      });
  };

  const handleSaveTopicIdea = async () => {
    if (!editedTopicIdea.trim()) {
      toast.error("Topic idea cannot be empty.");
      return;
    }
    // update local calendarData
    const updatedEntry = { ...selectedDay, topicIdea: editedTopicIdea };
    setSelectedDay(updatedEntry);
    setCalendarData((prev) =>
      prev.map((post) =>
        post.date === updatedEntry.date ? updatedEntry : post
      )
    );
    setIsEditingTopic(false);

    // TODO: POST to your backend to persist change
    // await axios.post(`${BASE_URL}/update-topic-idea`, { date: updatedEntry.date, topicIdea: editedTopicIdea }, { headers: { Authorization: token }});
    // toast.success("Topic idea updated.");
  };

  return (
    <div className={`calendar-container`}>
      <div className="calendar-header">
        <h1 className="calendar-title">
          <CalendarDays /> Content Calendar
        </h1>
        <div className="calendar-controls">
          <button onClick={goToPreviousMonth}>
            <ChevronLeft />
          </button>
          <span>
            {monthName} {currentYear}
          </span>
          <button onClick={goToNextMonth}>
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Days of the week */}
      <div className="calendar-weekdays">
        {weekDays.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Add empty cells to align the first day */}
        {Array(days[0].getDay())
          .fill(null)
          .map((_, idx) => (
            <div key={`empty-${idx}`} className="calendar-day empty"></div>
          ))}

        {/* Actual days */}
        {days.map((day) => {
          const dateStr = day.toLocaleDateString("en-CA");
          const entry = calendarData.find((e) => e.date === dateStr);
          const isToday = day.toDateString() === today.toDateString();

          return (
            <div
              key={dateStr}
              className={`calendar-day ${isToday ? "calendar-today" : ""}`}
              onClick={() => handleDayClick(day)}
            >
              <div className="day-number">{day.getDate()}</div>
              {entry && (
                <div className="entry-container">
                  <div className="entry-title">
                    {entry.topicIdea ? entry.topicIdea : "No topic idea"}
                  </div>
                  <div
                    className={`entry-status ${getStatusClass(entry.status)}`}
                  >
                    {entry.status}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Post Editing Card */}
      <Drawer
        title={`Edit Post - ${selectedDay?.date}`}
        placement="right"
        onClose={handleCloseCard}
        open={isCardOpen}
        width={700}
      >
        <div className="drawer-content">
          <div className="drawer-content-header">
            <div className="topic-idea-row">
              <div className="topic-idea">
                <strong>Topic Idea:</strong>
                {isEditingTopic ? (
                  <>
                    <Input
                      className="topic-edit-input"
                      value={editedTopicIdea}
                      onChange={(e) => setEditedTopicIdea(e.target.value)}
                      maxLength={MAX_CHARS}
                    />
                    <Button
                      size="small"
                      type="primary"
                      onClick={handleSaveTopicIdea}
                    >
                      Save
                    </Button>
                    <Button
                      size="small"
                      type="text"
                      onClick={() => setIsEditingTopic(false)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="topic-text">
                      {selectedDay?.topicIdea || "Type your post idea here..."}
                    </span>
                    <Button
                      className="edit-topic-btn"
                      size="small"
                      type="text"
                      icon={<Edit3 size={16} />}
                      onClick={() => {
                        setEditedTopicIdea(selectedDay.topicIdea);
                        setIsEditingTopic(true);
                      }}
                    />
                  </>
                )}
              </div>
              <div className="theme-dropdown">
                <strong>Theme:</strong>{" "}
                <Select
                  value={selectedTheme || undefined}
                  onChange={(value) => setSelectedTheme(value)}
                  style={{ width: 200 }}
                  placeholder="Select theme"
                >
                  {themes.map((theme) => (
                    <Select.Option key={theme} value={theme}>
                      {theme}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>

            <Button
              className="ai-generate-btn"
              onClick={handleGeneratePost}
              disabled={!selectedDay?.topicIdea || !selectedTheme}
              loading={isGenerating}
            >
              <Sparkles size={16} style={{ marginRight: "8px" }} />
              Generate with AI
            </Button>
          </div>

          <Input.TextArea
            rows={20}
            value={updatedPostContent}
            onChange={handlePostContentChange}
            placeholder="Write your post here..."
          />
          <div
            className="drawer-actions"
            style={{
              marginTop: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {/* <Button type="primary" onClick={handleGeneratePost}>
              Generate Post
            </Button> */}
            <Button
              type="default"
              onClick={handleSchedulePost}
              loading={isScheduling}
            >
              Schedule Post
            </Button>
            <Button type="dashed" danger onClick={handleCancelPost}>
              Cancel Post
            </Button>
            <Button type="dashed" danger onClick={handleDeletePost}>
              Delete Post
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default ContentCalendar;
