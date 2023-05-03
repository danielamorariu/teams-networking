// import debounce from "lodash/debounce";
import { getTeamsRequest, updateTeamRequest, createTeamRequest, deleteTeamRequest } from "./requests";
import { $, debounce, sleep } from "./utils";

let allTeams = [];
var editId;

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
      console.warn("same content");
      return false;
    }
  }
  previewDisplayedTeams = teams;
  const html = teams.map(getTeamAsHTML);
  $("table tbody").innerHTML = html.join("");
  return true;
}

//To do remove - not global
window.showTeams = showTeams;

async function formSubmit(e) {
  e.preventDefault();

  // se creaza echipa cu noile valori
  const team = getFormValues();

  if (editId) {
    team.id = editId;

    const { success } = await updateTeamRequest(team);
    if (success) {
      allTeams = allTeams.map(t => {
        if (t.id === team.id) {
          return {
            ...t, /// old props(eg. createdBy, createdAt)
            ...team
          };
        }
        return t;
      });
    }
  } else {
    const { success, id } = await createTeamRequest(team);
    if (success) {
      team.id = id;
      allTeams = [...allTeams, team];
    }
  }

  showTeams(allTeams) && $("#editForm").reset();
}

function getFormValues() {
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
  return team;
}

function setFormValues({ promotion, members, name, url }) {
  $("#promotion").value = promotion;
  $("#members").value = members;
  $("#project").value = name;
  $("#url").value = url;
}

async function deleteTeam(id) {
  const { success } = await deleteTeamRequest(id);
  if (success) {
    // window.location.reload();
    // loadTeams();
    allTeams = allTeams.filter(t => t.id !== id);
    showTeams(allTeams);
  }
}

function startEditTeam(id) {
  editId = id;
  // const team = allTeams.find(team => team.id === id);
  // const { promotion, members, name, url } = team;
  const team = allTeams.find(t => t.id === id);

  setFormValues(team);
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

  $("#search").addEventListener(
    "input",
    debounce(function (e) {
      const search = e.target.value;
      console.info("search", search);
      const teams = searchTeams(allTeams, search);
      showTeams(teams);
    }, 500)
  );

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

async function loadTeams(cb) {
  const teams = await getTeamsRequest();
  // window.teams = teams;
  allTeams = teams;
  showTeams(teams);
  if (typeof cb == "function") {
    cb();
  }
  return teams;
}

(async () => {
  // Loading mask
  $("#editForm").classList.add("loading-mask");
  await loadTeams();
  await sleep(2000);
  $("#editForm").classList.remove("loading-mask");

  // console.info("start");

  // sleep(6000).then(() => {
  //   console.info("ready to %o", "GO 🏎");
  // });

  // console.warn("after sleep");

  // await sleep(5000);
  // console.info("await");
})();

// (function () {
//   console.info("dddddd");
// })();

initEvents();
