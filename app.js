const seed = {
  projects: [
    { name: "Launch film / S2", client: "Northstar Labs", initials: "NL", budget: 480000, status: "Working", progress: 72, due: "2026-06-18", tone: "", voiceover: "https://drive.google.com", script: "https://docs.google.com", video: "https://vimeo.com", instructions: "Keep the first 5 seconds fast and product-led." },
    { name: "Brand voice system", client: "Onda Coffee", initials: "OC", budget: 260000, status: "Working", progress: 48, due: "2026-06-22", tone: "orange", voiceover: "", script: "https://docs.google.com", video: "", instructions: "Warm, direct, never overly polished." },
    { name: "Founder story", client: "Pine & Co.", initials: "PC", budget: 190000, status: "Not working", progress: 32, due: "2026-06-25", tone: "green", voiceover: "", script: "", video: "", instructions: "Waiting for the founder interview." },
    { name: "Product walkthrough", client: "Fathom Health", initials: "FH", budget: 320000, status: "Completed", progress: 100, due: "2026-06-11", tone: "", voiceover: "https://drive.google.com", script: "https://docs.google.com", video: "https://vimeo.com", instructions: "Final approved version." }
  ],
  editors: [
    { name: "Leah Morgan", email: "leah@example.com", initials: "LM", project: "Launch film / S2", fee: 220000, due: "2026-06-19", status: "Working" },
    { name: "Samir Khan", email: "samir@example.com", initials: "SK", project: "Brand voice system", fee: 95000, due: "2026-06-22", status: "Working" }
  ],
  tasks: [
    { id: 1, date: "2026-06-18", time: "09:00", title: "Review Northstar first cut", project: "Launch film / S2", done: false },
    { id: 2, date: "2026-06-18", time: "11:30", title: "Send Onda voice notes", project: "Brand voice system", done: false },
    { id: 3, date: "2026-06-18", time: "14:00", title: "Approve editor invoice", project: "Admin · June payout", done: true },
    { id: 4, date: "2026-06-19", time: "16:30", title: "Write Pine founder prompts", project: "Founder story", done: false }
  ]
};

const defaultUser = { name: "Fahad", projects: seed.projects, editors: seed.editors, tasks: seed.tasks };
const storedUsers = JSON.parse(localStorage.getItem("draftline-users") || "null");
const users = storedUsers || { Fahad: structuredClone(defaultUser) };
let activeUser = localStorage.getItem("draftline-active-user") || "Fahad";
if (!users[activeUser]) users[activeUser] = structuredClone(defaultUser);
let data = users[activeUser];
const pageContent = document.querySelector("#pageContent");
const breadcrumb = document.querySelector("#breadcrumb");
const navItems = document.querySelectorAll(".nav-item[data-page]");
const toast = document.querySelector("#toast");
const money = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });

function currency(value) { return money.format(value); }
function persist() { users[activeUser] = data; localStorage.setItem("draftline-users", JSON.stringify(users)); localStorage.setItem("draftline-active-user", activeUser); }
function logo(item) { return `<span class="client-logo ${item.tone || ""}">${item.initials || item.name.slice(0, 2).toUpperCase()}</span>`; }
function normalizeStatus(status) {
  if (status === "In progress" || status === "Assigned") return "Working";
  if (status === "Paused" || status === "Unassigned") return "Not working";
  return status === "Completed" ? "Completed" : "Working";
}
function statusClass(status) { return normalizeStatus(status) === "Completed" ? "done" : normalizeStatus(status) === "Not working" ? "paused" : "active"; }
function formatDate(value) { return value ? new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "No date"; }
function pageHeader(title, description, action = "") { return `<div class="page-heading"><div><h1>${title}</h1><p>${description}</p></div>${action}</div>`; }
function panelHeader(title, subtitle = "") { return `<div class="panel-header"><div><h2>${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ""}</div><button class="icon-button subtle" aria-label="More options">•••</button></div>`; }
function chartBars(values = [58, 81, 64, 93, 53, 76, 86]) { return `<div class="chart-wrap"><div class="chart-grid"><span></span><span></span><span></span><span></span></div><div class="bars">${values.map((value, index) => `<div class="bar-group"><div class="bar" style="height:${value}%"></div><small>${["M", "T", "W", "T", "F", "S", "S"][index]}</small></div>`).join("")}</div></div>`; }

function overview() {
  const active = data.projects.filter(p => normalizeStatus(p.status) === "Working").length;
  const total = data.projects.reduce((sum, p) => sum + p.budget, 0);
  const editorTotal = data.editors.reduce((sum, e) => sum + e.fee, 0);
  const isEmpty = data.projects.length === 0 && data.editors.length === 0 && data.tasks.length === 0;
  const pulse = isEmpty ? 0 : 1284000;
  return `${pageHeader(`Good morning, ${data.name}.`, isEmpty ? "Your workspace is ready. Add a project, editor, or task to begin." : "Here’s the shape of your work this week.")}
  <div class="overview-grid"><section class="panel pulse-panel">${panelHeader("Weekly pulse", "Revenue collected vs. last week")}<div class="pulse-top"><div class="pulse-value">${currency(pulse)} ${pulse ? '<span class="trend-up">↑ 18%</span>' : ""}<small>this week</small></div></div>${chartBars(isEmpty ? [0,0,0,0,0,0,0] : [51,72,65,95,59,78,86])}<div class="chart-foot"><span>Mon, Jun 15 — Sun, Jun 21</span><strong>${active} active projects</strong></div></section>
  <section class="panel money-panel">${panelHeader("Your take-home", "After editor payouts")}<div class="money-value">${currency(total - editorTotal)}<small>June to date</small></div><div class="money-divider"></div><div class="money-breakdown"><div><span>Project budgets</span><strong>${currency(total)}</strong></div><div><span>Editor payouts</span><strong>− ${currency(editorTotal)}</strong></div><div><span>Outstanding</span><strong style="color:#f2c573">${currency(isEmpty ? 0 : 320000)}</strong></div></div></section></div>
  <div class="lower-grid"><section class="panel queue-panel">${panelHeader("Today’s queue", "Tuesday, June 18")}<div class="queue-list">${data.tasks.filter(t => t.date === "2026-06-18").slice(0,3).map(task => `<div class="queue-item"><span class="task-time">${task.time}</span><i class="task-dot ${task.done ? "amber" : ""}"></i><div><strong>${task.title}</strong><small>${task.project}</small></div></div>`).join("")}</div></section>
  <section class="panel projects-panel">${panelHeader("Projects at a glance", "The work currently moving")}<table class="mini-table"><thead><tr><th>Project</th><th>Status</th><th>Budget</th></tr></thead><tbody>${data.projects.slice(0,3).map(p => `<tr><td><div class="client-cell">${logo(p)}<span>${p.name}</span></div></td><td><span class="status ${statusClass(p.status)}">${normalizeStatus(p.status)}</span></td><td>${currency(p.budget)}</td></tr>`).join("")}</tbody></table></section></div>`;
}

function projectRow(p, index) {
  const links = [["voiceover", "Voice-over"], ["script", "Script"], ["video", "Video"]].map(([key, label]) => `<label class="link-edit"><span>${label}</span><input type="url" data-project="${index}" data-field="${key}" value="${p[key] || ""}" placeholder="Paste link" /></label>`).join("");
  return `<tr><td><input class="inline-input project-name-input" data-project="${index}" data-field="name" value="${p.name}" /><small class="project-subline">${p.client}</small></td><td><div class="link-row">${links || '<span class="muted-text">No links yet</span>'}</div><textarea class="inline-instruction" data-project="${index}" data-field="instructions" placeholder="Instruction box">${p.instructions || ""}</textarea></td><td><select class="inline-select" data-project="${index}" data-field="status"><option ${normalizeStatus(p.status) === "Working" ? "selected" : ""}>Working</option><option ${normalizeStatus(p.status) === "Not working" ? "selected" : ""}>Not working</option><option ${normalizeStatus(p.status) === "Completed" ? "selected" : ""}>Completed</option></select></td><td><input class="inline-input compact-input" type="number" min="0" max="100" data-project="${index}" data-field="progress" value="${p.progress}" />%</td><td><input class="inline-input date-input" type="date" data-project="${index}" data-field="due" value="${p.due || ""}" /></td><td><input class="inline-input budget-input" type="number" data-project="${index}" data-field="budget" value="${p.budget}" /></td><td><button class="danger-text delete-project" data-project="${index}">Remove</button></td></tr>`;
}

function projectsPage() {
  return `${pageHeader("Projects", "Edit every project directly: budgets, delivery links, status, and instructions.", `<button class="primary-button" id="addProject">Add project <span>+</span></button>`)}
  <section class="panel data-panel"><table class="data-table projects-edit-table"><thead><tr><th>Project</th><th>Work links + instructions</th><th>Status</th><th>Progress</th><th>Due</th><th>Budget (PKR)</th><th></th></tr></thead><tbody>${data.projects.map(projectRow).join("")}</tbody></table></section>`;
}

function editorRow(editor, index) {
  return `<tr><td><div class="client-cell">${logo(editor)}<input class="inline-input" data-editor="${index}" data-field="name" value="${editor.name}" /></div><small class="project-subline">${editor.email}</small></td><td><select class="inline-select" data-editor="${index}" data-field="project"><option value="">Unassigned</option>${data.projects.map(p => `<option ${editor.project === p.name ? "selected" : ""}>${p.name}</option>`).join("")}</select></td><td><input class="inline-input budget-input" type="number" data-editor="${index}" data-field="fee" value="${editor.fee}" /></td><td><input class="inline-input date-input" type="date" data-editor="${index}" data-field="due" value="${editor.due || ""}" /></td><td><select class="inline-select" data-editor="${index}" data-field="status"><option ${normalizeStatus(editor.status) === "Working" ? "selected" : ""}>Working</option><option ${normalizeStatus(editor.status) === "Not working" ? "selected" : ""}>Not working</option><option ${normalizeStatus(editor.status) === "Completed" ? "selected" : ""}>Completed</option></select></td><td><button class="danger-text delete-editor" data-editor="${index}">Remove</button></td></tr>`;
}

function editorPage() {
  return `${pageHeader("Editors", "Add editors, assign projects, and keep payouts tied to delivery.", `<button class="primary-button" id="addEditor">Add editor <span>+</span></button>`)}
  <section class="panel data-panel"><table class="data-table"><thead><tr><th>Editor</th><th>Assigned project</th><th>Fee (PKR)</th><th>Due back</th><th>Status</th><th></th></tr></thead><tbody>${data.editors.map(editorRow).join("")}</tbody></table></section>`;
}

function taskRow(task, index) { return `<div class="task-row ${task.done ? "completed" : ""}"><input class="task-check" type="checkbox" ${task.done ? "checked" : ""} data-task="${index}" /><div class="task-copy"><strong>${task.title}</strong><small>${task.project} · ${formatDate(task.date)}</small></div><span class="task-time-box">${task.time}</span><button class="edit-task" data-task="${index}" aria-label="Edit task">✎</button><button class="danger-text delete-task" data-task="${index}">Remove</button></div>`; }

function tasksPage() {
  const dates = [...new Set(data.tasks.map(t => t.date))].sort();
  const activeDate = window.selectedTaskDate || dates[0] || "2026-06-18";
  const visible = data.tasks.map((task, index) => ({ task, index })).filter(({ task }) => task.date === activeDate);
  return `${pageHeader("My tasks", "Add, edit, remove, and schedule tasks on any date.", `<button class="primary-button" id="addTask">Add task <span>+</span></button>`)}
  <div class="task-layout"><section class="panel task-board">${panelHeader(formatDate(activeDate), `${visible.length} tasks · ${visible.filter(x => x.task.done).length} completed`)}<div class="day-tabs">${dates.map(date => `<button class="day-tab ${date === activeDate ? "active" : ""}" data-date="${date}">${formatDate(date)}</button>`).join("")}</div><div id="taskList">${visible.length ? visible.map(({task,index}) => taskRow(task,index)).join("") : '<div class="empty-state">No tasks on this date. Add one to start the day.</div>'}</div></section>
  <section class="panel calendar-panel">${panelHeader("Task calendar", "Previous and upcoming work")}<div class="calendar-header"><button class="icon-button subtle">←</button><strong>June 2026</strong><button class="icon-button subtle">→</button></div><div class="calendar-grid">${["M","T","W","T","F","S","S"].map(d => `<span>${d}</span>`).join("")}${Array.from({length:30}, (_, i) => { const date = `2026-06-${String(i+1).padStart(2,"0")}`; const has = data.tasks.some(t => t.date === date); return `<button class="${has ? "has-task" : ""} ${date === activeDate ? "selected" : ""}" data-calendar-date="${date}">${i+1}</button>`; }).join("")}</div></section></div>`;
}

function settingsPage() {
  return `${pageHeader("Settings", "Manage people and keep each person’s workspace separate.")}
  <div class="settings-grid"><section class="panel settings-card">${panelHeader("Users", "Every user starts with a clean workspace")}<div class="user-list">${Object.values(users).map(user => `<button class="user-row ${user.name === activeUser ? "current" : ""}" data-user="${user.name}"><span class="profile-avatar">${user.name.slice(0,2).toUpperCase()}</span><span><strong>${user.name}</strong><small>${user.name === activeUser ? "Current user" : "Separate workspace"}</small></span><span>→</span></button>`).join("")}</div><button class="secondary-button full" id="addUser">Add user</button></section>
  <section class="panel settings-card">${panelHeader("Reset workspace", "Remove this user’s projects, editors, and tasks")}<p class="settings-warning">Resetting <strong>${activeUser}</strong> returns this workspace to zero. This cannot be undone.</p><button class="danger-button full" id="resetData">Reset ${activeUser}’s workspace</button></section></div>`;
}

function userDialog() {
  const dialog = document.querySelector("#projectDialog");
  dialog.innerHTML = `<form method="dialog" id="userForm"><div class="dialog-header"><div><p class="eyebrow">New workspace</p><h2>Add user</h2></div><button type="submit" formnovalidate class="dialog-close" value="cancel">×</button></div><label>User name<input required name="name" placeholder="e.g. Aisha" /></label><button class="primary-button full" value="default">Create empty workspace <span>→</span></button></form>`;
  dialog.showModal();
  document.querySelector("#userForm").addEventListener("submit", e => { e.preventDefault(); const name = new FormData(e.target).get("name").trim(); if (!name || users[name]) return showToast("Choose a new user name"); users[name] = { name, projects: [], editors: [], tasks: [] }; activeUser = name; data = users[name]; persist(); dialog.close(); render("overview"); showToast(`${name} workspace created`); });
}

function openTaskDialog(index = -1) {
  const dialog = document.querySelector("#projectDialog");
  const task = index >= 0 ? data.tasks[index] : { title: "", project: "", date: window.selectedTaskDate || "2026-06-18", time: "09:00" };
  dialog.innerHTML = `<form method="dialog" id="taskForm"><div class="dialog-header"><div><p class="eyebrow">${index >= 0 ? "Edit task" : "New task"}</p><h2>${index >= 0 ? "Update task" : "Add task"}</h2></div><button type="submit" formnovalidate class="dialog-close" value="cancel">×</button></div><label>Task name<input required name="title" value="${task.title}" placeholder="e.g. Send client follow-up" /></label><label>Project or context<input name="project" value="${task.project}" placeholder="e.g. Launch film / S2" /></label><div class="form-grid"><label>Date<input required name="date" type="date" value="${task.date}" /></label><label>Time<input required name="time" type="time" value="${task.time}" /></label></div><button class="primary-button full" value="default">${index >= 0 ? "Save task" : "Add task"} <span>→</span></button></form>`;
  dialog.showModal();
  document.querySelector("#taskForm").addEventListener("submit", e => {
    e.preventDefault();
    const form = new FormData(e.target);
    const updated = { title: form.get("title").trim(), project: form.get("project").trim() || "General", date: form.get("date"), time: form.get("time"), done: index >= 0 ? data.tasks[index].done : false, id: index >= 0 ? data.tasks[index].id : Date.now() };
    if (index >= 0) data.tasks[index] = updated; else data.tasks.push(updated);
    window.selectedTaskDate = updated.date;
    persist(); dialog.close(); render("tasks"); showToast(index >= 0 ? "Task updated" : "Task added");
  });
}

function openProjectDialog() {
  const dialog = document.querySelector("#projectDialog");
  dialog.innerHTML = `<form method="dialog" id="projectForm"><div class="dialog-header"><div><p class="eyebrow">Project details</p><h2>Add a project</h2></div><button type="submit" formnovalidate class="dialog-close" value="cancel">×</button></div><label>Project name<input required name="name" placeholder="e.g. Paper plane launch" /></label><label>Client<input required name="client" placeholder="e.g. Northstar Labs" /></label><div class="form-grid"><label>Budget (PKR)<input required name="budget" type="number" placeholder="250000" /></label><label>Due date<input required name="due" type="date" /></label></div><div class="form-grid"><label>Voice-over link<input name="voiceover" type="url" placeholder="https://..." /></label><label>Script link<input name="script" type="url" placeholder="https://..." /></label></div><label>Video link<input name="video" type="url" placeholder="https://..." /></label><label>Instruction box<textarea name="instructions" rows="3" placeholder="A quick brief for your future self..."></textarea></label><button class="primary-button full" value="default">Create project <span>→</span></button></form>`;
  dialog.showModal();
  document.querySelector("#projectForm").addEventListener("submit", e => { e.preventDefault(); const form = new FormData(e.target); const client = form.get("client"); data.projects.unshift({ name: form.get("name"), client, initials: client.slice(0,2).toUpperCase(), budget: Number(form.get("budget")), status: "Working", progress: 0, due: form.get("due"), tone: "", voiceover: form.get("voiceover"), script: form.get("script"), video: form.get("video"), instructions: form.get("instructions") }); persist(); dialog.close(); render("projects"); showToast("Project added"); });
}

function bindPageActions() {
  document.querySelector("#addProject")?.addEventListener("click", openProjectDialog);
  document.querySelector("#addEditor")?.addEventListener("click", () => { data.editors.push({ name: "New editor", email: "add@email.com", initials: "NE", project: "", fee: 0, due: "", status: "Not working" }); persist(); render("editor"); showToast("Editor added"); });
  document.querySelector("#addTask")?.addEventListener("click", () => openTaskDialog());
  document.querySelector("#userSwitch")?.addEventListener("click", () => render("settings"));
  document.querySelector("#userSwitchTop")?.addEventListener("click", () => render("settings"));
  document.querySelector("#addUser")?.addEventListener("click", userDialog);
  document.querySelector("#resetData")?.addEventListener("click", () => { if (confirm(`Reset ${activeUser}'s workspace?`)) { data = { name: activeUser, projects: [], editors: [], tasks: [] }; persist(); render("overview"); showToast("Workspace reset to zero"); } });
  document.querySelectorAll(".user-row").forEach(btn => btn.addEventListener("click", () => { activeUser = btn.dataset.user; data = users[activeUser]; persist(); render("overview"); showToast(`Switched to ${activeUser}`); }));
  document.querySelectorAll("[data-project][data-field]").forEach(input => input.addEventListener("change", e => { const target = e.target; data.projects[Number(target.dataset.project)][target.dataset.field] = target.type === "number" ? Number(target.value) : target.value; persist(); showToast("Project saved"); }));
  document.querySelectorAll(".delete-project").forEach(btn => btn.addEventListener("click", () => { data.projects.splice(Number(btn.dataset.project), 1); persist(); render("projects"); showToast("Project removed"); }));
  document.querySelectorAll("[data-editor][data-field]").forEach(input => input.addEventListener("change", e => { const target = e.target; data.editors[Number(target.dataset.editor)][target.dataset.field] = target.type === "number" ? Number(target.value) : target.value; persist(); showToast("Editor saved"); }));
  document.querySelectorAll(".delete-editor").forEach(btn => btn.addEventListener("click", () => { data.editors.splice(Number(btn.dataset.editor), 1); persist(); render("editor"); showToast("Editor removed"); }));
  document.querySelectorAll(".task-check").forEach(check => check.addEventListener("change", e => { data.tasks[Number(e.target.dataset.task)].done = e.target.checked; persist(); render("tasks"); showToast(e.target.checked ? "Task completed" : "Task reopened"); }));
  document.querySelectorAll(".delete-task").forEach(btn => btn.addEventListener("click", () => { data.tasks.splice(Number(btn.dataset.task), 1); persist(); render("tasks"); showToast("Task removed"); }));
  document.querySelectorAll(".edit-task").forEach(btn => btn.addEventListener("click", () => openTaskDialog(Number(btn.dataset.task))));
  document.querySelectorAll("[data-date]").forEach(btn => btn.addEventListener("click", () => { window.selectedTaskDate = btn.dataset.date; render("tasks"); }));
  document.querySelectorAll("[data-calendar-date]").forEach(btn => btn.addEventListener("click", () => { window.selectedTaskDate = btn.dataset.calendarDate; render("tasks"); }));
}

function render(page = "overview") {
  const pages = { overview, projects: projectsPage, editor: editorPage, tasks: tasksPage, settings: settingsPage };
  pageContent.innerHTML = (pages[page] || overview)();
  breadcrumb.textContent = page === "overview" ? "Overview" : page === "editor" ? "Editors" : page[0].toUpperCase() + page.slice(1);
  const switcher = document.querySelector("#userSwitchTop");
  if (switcher) switcher.innerHTML = `<span class="profile-avatar">${activeUser.slice(0, 2).toUpperCase()}</span> ${activeUser} · Switch`;
  navItems.forEach(item => item.classList.toggle("active", item.dataset.page === page));
  bindPageActions();
}
function showToast(message) { toast.querySelector("p").textContent = message; toast.classList.add("show"); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2400); }
navItems.forEach(item => item.addEventListener("click", () => render(item.dataset.page)));
document.querySelector("#themeToggle").addEventListener("click", () => { document.documentElement.dataset.theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; localStorage.setItem("draftline-theme", document.documentElement.dataset.theme); });
if (localStorage.getItem("draftline-theme") === "dark") document.documentElement.dataset.theme = "dark";
render();
