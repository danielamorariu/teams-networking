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

function deleteTeamRequest(id, successDelete) {
  // console.info(successDelete);

  //   DELETE teams-json/delete
  return fetch("http://localhost:3000/teams-json/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id })
  })
    .then(r => r.json())
    .then(status => {
      // console.warn("beefore removee", status);
      if (typeof successDelete == "function") {
        const r = successDelete(status);
        // console.info("raspuns", r);
      }
      return status;
    });
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

function getTeamAsHTML({ id, url, promotion, members, name }) {
  // const id = team.id;
  // const url = team.url;
  // const { id, url, promotion, members, name } = team;
  let displayUrl = url;

  if (url.startsWith("https://")) {
    displayUrl = url.substring(8);
  }

  return `
    <tr>
      <td>${promotion}</td>
      <td>${members}</td>
      <td>${name}</td>
      <td><a href="${url}" target="_blank">${displayUrl}</a></td>
      <td>
        <a data-id="${id}" class="link-btn remove-btn">✖️</a>
        <a data-id="${id}" class="link-btn edit-btn">✎</a>
      </td>
    </tr>`;
}

let previewDisplayedTeams = [];
function showTeams(teams) {
  if (teams == previewDisplayedTeams) {
    console.info("same teams");
    return false;
  }

  if (teams.length === previewDisplayedTeams.length) {
    var eqContent = teams.every((team, i) => team === previewDisplayedTeams[i]);
    // console.warn("eq", eqContent, teams[0] === previewDisplayedTeams[0]);

    if (eqContent) {
      // console.warn("same content");
      return;
    }
  }
  previewDisplayedTeams = teams;
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
      if (status.success) {
        // v.1
        // window.location.reload();

        // v.2
        // loadTeams().then(() => {
        //   $("#editForm").reset();
        // });

        // v.3
        // allTeams = [...allTeams];
        // var oldTeam = allTeams.find(t => t.id === team.id);
        // oldTeam.promotion = team.promotion;
        // oldTeam.members = team.members;
        // oldTeam.name = team.name;
        // oldTeam.url = team.url;

        allTeams = allTeams.map(t => {
          if (t.id === team.id) {
            return {
              ...t, /// olld props(eg. createdBy, createdAt)
              ...team
            };
          }
          return t;
        });

        showTeams(allTeams);
        $("#editForm").reset();
      }
    });
  } else {
    createTeamRequest(team).then(({ success, id }) => {
      if (success) {
        // v.1
        // window.location.reload();

        // v.2
        // loadTeams(() => {
        //   $("#editForm").reset();
        // });

        // v.3
        team.id = id;
        // allTeams.push(team);
        allTeams = [...allTeams, team];
        showTeams(allTeams);
        $("#editForm").reset();
      }
    });
  }
}

async function deleteTeam(id) {
  const status = await deleteTeamRequest(id, status => {
    console.info("callback success", status);
    return id;
  });
  if (status.success) {
    // window.location.reload();
    loadTeams();
  }
}

function startEditTeam(edit) {
  editId = edit;
  // const team = allTeams.find(team => team.id === id);
  // const { promotion, members, name, url } = team;
  const { promotion, members, name, url } = allTeams.find(({ id }) => id === edit);

  $("#promotion").value = promotion;
  $("#members").value = members;
  $("#project").value = name;
  $("#url").value = url;
}

function searchTeams(teams, search) {
  search = search.toLowerCase();
  return teams.filter(team => {
    return (
      team.members.toLowerCase().includes(search) ||
      team.promotion.toLowerCase().includes(search) ||
      team.name.toLowerCase().includes(search) ||
      team.url.toLowerCase().includes(search)
    );
  });
}

function initEvents() {
  const form = $("#editForm");
  form.addEventListener("submit", formSubmit);
  form.addEventListener("reset", () => {
    editId = undefined;
  });

  $("#search").addEventListener("input", e => {
    const search = e.target.value;
    const teams = searchTeams(allTeams, search);
    showTeams(teams);
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
function loadTeams(cb) {
  return getTeamsRequest().then(teams => {
    // window.teams = teams;
    allTeams = teams;
    showTeams(teams);
    if (typeof cb == "function") {
      cb();
    }
  });
}
function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

(async () => {
  console.info("start");

  sleep(6000).then(() => {
    console.info("ready to %o", "GO 🏎");
  });

  console.warn("after sleep");

  await sleep(5000);
  console.info("await");
})();

// (function () {
//   console.info("dddddd");
// })();

loadTeams();
initEvents();
