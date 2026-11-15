"use strict";

// navigation
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-header nav");
if (toggle) {
  toggle.addEventListener("click", function () {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
}

// academic planner
const taskForm = document.getElementById("taskForm");
if (taskForm) {
  const input = document.getElementById("taskInput");
  const dateInput = document.getElementById("taskDate");
  const list = document.getElementById("taskList");
  const errorBox = document.getElementById("taskError");
  const countBox = document.getElementById("taskCount");
  const progressBar = document.getElementById("progressBar");
  const progressFill = document.getElementById("progressFill");
  const clearBtn = document.getElementById("clearDone");
  const filterButtons = document.querySelectorAll(".filter");
  const emptyMessages = {
    all: "No tasks yet. Add your first one using the form.",
    active: "Nothing left to do.",
    done: "No completed tasks yet.",
  };
  let tasks = [];
  let filter = "all";

  try {
    tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  } catch (e) {
    tasks = [];
  }

  function save() {
    try {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (e) {
      alert("Unable to save task")
    }
  }

  // Works out the label under a task, and whether it is overdue
  function getDueInfo(task) {
    const parts = task.date.split("-");
    const due = new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2]),
    );
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const days = Math.round((due - today) / 86400000);

    if (task.done) return { text: "Due " + task.date, overdue: false };
    if (days < 0) {
      return {
        text: "Overdue by " + Math.abs(days) + (days === -1 ? " day" : " days"),
        overdue: true,
      };
    }
    if (days === 0) return { text: "Due today", overdue: false };
    if (days === 1) return { text: "Due tomorrow", overdue: false };
    return { text: "Due " + task.date, overdue: false };
  }

  // Updates the progress bar, the count text, the filter counts and the clear button
  function updateSummary() {
    const done = tasks.filter(function (t) {
      return t.done;
    }).length;
    const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

    progressFill.style.width = percent + "%";
    progressBar.setAttribute("aria-valuenow", percent);
    progressBar.classList.toggle(
      "is-complete",
      tasks.length > 0 && done === tasks.length,
    );

    countBox.textContent = tasks.length
      ? done + " of " + tasks.length + " tasks completed"
      : "No tasks yet. Add your first one using the form.";
    clearBtn.hidden = done === 0;

    const counts = {
      all: tasks.length,
      active: tasks.length - done,
      done: done,
    };
    filterButtons.forEach(function (button) {
      const name = button.dataset.filter;
      button.querySelector(".count").textContent = counts[name];
      button.classList.toggle("is-active", name === filter);
      button.setAttribute("aria-pressed", name === filter);
    });
  }

  function render() {
    list.innerHTML = "";

    const shown = tasks.filter(function (t) {
      if (filter === "active") return !t.done;
      if (filter === "done") return t.done;
      return true;
    });

    shown.forEach(function (task) {
      const info = task.date ? getDueInfo(task) : null;

      const li = document.createElement("li");
      li.className =
        "task" +
        (task.done ? " done" : "") +
        (info && info.overdue ? " overdue" : "");

      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = task.done;
      box.setAttribute("aria-label", "Mark " + task.text + " as completed");
      box.addEventListener("change", function () {
        toggleTask(task.id);
      });

      const label = document.createElement("span");
      label.className = "task-text";
      label.textContent = task.text;
      if (info) {
        const small = document.createElement("small");
        small.textContent = info.text;
        label.appendChild(small);
      }

      const del = document.createElement("button");
      del.className = "task-del";
      del.type = "button";
      del.textContent = "Delete";
      del.addEventListener("click", function () {
        deleteTask(task.id);
      });

      li.append(box, label, del);
      list.appendChild(li);
    });

    if (shown.length === 0) {
      const empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = emptyMessages[filter];
      list.appendChild(empty);
    }

    updateSummary();
  }

  function addTask(text, date) {
    tasks.push({ id: Date.now(), text: text, date: date, done: false });
    save();
    render();
  }
  function toggleTask(id) {
    tasks = tasks.map(function (t) {
      return t.id === id
        ? { id: t.id, text: t.text, date: t.date, done: !t.done }
        : t;
    });
    save();
    render();
  }
  function deleteTask(id) {
    tasks = tasks.filter(function (t) {
      return t.id !== id;
    });
    save();
    render();
  }
  function clearCompleted() {
    tasks = tasks.filter(function (t) {
      return !t.done;
    });
    save();
    render();
  }

  taskForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const text = input.value.trim();
    if (text === "") {
      errorBox.textContent = "Enter a task before adding it.";
      input.classList.add("invalid");
      return;
    }
    errorBox.textContent = "";
    input.classList.remove("invalid");
    filter = "all";
    addTask(text, dateInput.value);
    taskForm.reset();
    input.focus();
  });

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filter = button.dataset.filter;
      render();
    });
  });

  clearBtn.addEventListener("click", clearCompleted);

  render();
}

// contact form validation
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const digitsOnly = /^\d+$/;

  function setError(id, message) {
    const field = document.getElementById(id);
    document.getElementById(id + "Error").textContent = message;
    field.classList.toggle("invalid", message !== "");
    return message === "";
  }

  function validate() {
    const v = {
      name: contactForm.elements["name"].value.trim(),
      email: contactForm.elements["email"].value.trim(),
      phone: contactForm.elements["phone"].value.trim(),
      message: contactForm.elements["message"].value.trim(),
    };
    let ok = true;
    ok = setError("name", v.name === "" ? "Enter your name." : "") && ok;
    ok =
      setError(
        "email",
        v.email === ""
          ? "Enter your email address."
          : !emailPattern.test(v.email)
            ? "Enter a valid email, like name@example.com."
            : "",
      ) && ok;
    ok =
      setError(
        "phone",
        v.phone === ""
          ? "Enter your phone number."
          : !digitsOnly.test(v.phone)
            ? "Use digits only, with no spaces, + or dashes."
            : "",
      ) && ok;
    ok = setError("message", v.message === "" ? "Write a message." : "") && ok;
    return ok;
  }

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const success = document.getElementById("formSuccess");
    success.textContent = "";
    if (validate()) {
      success.textContent = "Message sent. Thank you, I will reply soon.";
      contactForm.reset();
    }
  });
}
