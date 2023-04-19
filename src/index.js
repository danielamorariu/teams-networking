let allTeams = [];
var editId;

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

function updateTeamRequest(team) {
  // PUT teams-json/update
  return fetch("http://localhost:3000/teams-json/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
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
        <a data-id="${team.id}" class="link-btn remove-btn">✖️</a>
        <a data-id="${team.id}" class="link-btn edit-btn">✎</a>
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

  if (editId) {
    team.id = editId;
    // console.log(team, editId);
    updateTeamRequest(team).then(status => {
      console.info("updated", status);
      if (status.success) {
        window.location.reload();
      }
    });
  } else {
    createTeamRequest(team).then(status => {
      console.info("created", status);
      if (status.success) {
        window.location.reload();
      }
    });
  }
}

function deleteTeam(id) {
  deleteTeamRequest(id).then(status => {
    if (status.success) {
      window.location.reload();
    }
  });
}

function startEditTeam(id) {
  editId = id;
  const team = allTeams.find(team => team.id === id);

  $("#promotion").value = team.promotion;
  $("#members").value = team.members;
  $("#project").value = team.name;
  $("#url").value = team.url;
}

function searchTeams(search) {
  return allTeams.filter(team => {
    if (team.members.toLowerCase().includes(search.toLowerCase()) === true) {
      return true;
    } else if (team.promotion.toLowerCase().includes(search.toLowerCase())) {
      return true;
    }
  });
}

function initEvents() {
  const form = $("#editForm");
  form.addEventListener("submit", formSubmit);
  form.addEventListener("reset", () => {
    editId = undefined;
  });

  $("#search").addEventListener("input", e => {
    // const search = $("#search").value;
    const search = e.target.value;
    const teams = searchTeams(search);
    showTeams(teams);
    // console.table(teams);
    // console.log("search", search, e);
  });

  $("tbody").addEventListener("click", e => {
    if (e.target.matches("a.remove-btn")) {
      const id = e.target.dataset.id;
      deleteTeam(id);
    } else if (e.target.matches("a.edit-btn")) {
      const id = e.target.dataset.id;
      startEditTeam(id);
    }
  });
}

getTeamsRequest().then(teams => {
  // window.teams = teams;
  allTeams = teams;
  showTeams(teams);
});

initEvents();
