function getTeamsRequest() {
  // GET teams-json
  return fetch("http://localhost:3000/teams-json", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  }).then(r => r.json());
}

function createTeamRequest(team) {
  // POST teams-json/create
  return fetch("http://localhost:3000/teams-json/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  }).then(r => r.json());
}

function deleteTeamRequest(id) {
  //   DELETE teams-json/delete
  return fetch("http://localhost:3000/teams-json/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id })
  }).then(r => r.json());
}

function getTeamAsHTML(team) {
  return `
    <tr>
      <td>${team.promotion}</td>
      <td>${team.members}</td>
      <td>${team.name}</td>
      <td>${team.url}</td>
      <td>
        <a data-id="${team.id}">✖️</a>
      </td>
    </tr>`;
}

function showTeams(teams) {
  const html = teams.map(getTeamAsHTML);
  $("table tbody").innerHTML = html.join("");
}

function $(selector) {
  return document.querySelector(selector);
}

function formSubmit(e) {
  e.preventDefault();
  const promotion = $("#promotion").value;
  const members = $("#members").value;
  const projectValue = $("#project").value;
  const urlValue = $("#url").value;

  const team = {
    promotion,
    members,
    name: projectValue,
    url: urlValue
  };
  // console.warn("submit ", e);
  createTeamRequest(team).then(status => {
    console.info("status", status);
    window.location.reload();
  });
}

function deleteTeam(id) {
  deleteTeamRequest(id).then(status => {
    if (status.success) {
      window.location.reload();
    }
  });
}

function initEvents() {
  $("#editForm").addEventListener("submit", formSubmit);
  $("tbody").addEventListener("click", e => {
    if (e.target.matches("a")) {
      const id = e.target.dataset.id;
      deleteTeam(id);
    }
  });
}

const p = getTeamsRequest().then(teams => {
  showTeams(teams);
});

initEvents();