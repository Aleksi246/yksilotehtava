const map = L.map('map').setView([60.1695, 24.933], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const table = document.querySelector('#maintable');

document.querySelector('#logregbtn').addEventListener('click', () => {
  document.querySelector('#logregdialog').showModal();
});
document.querySelector('#closelogreg').addEventListener('click', (e) => {
  e.preventDefault();
  document.querySelector('#logregdialog').close();
});

async function checkUserNameAvailability(username) {
  try {
    const response = await fetch(
      `https://media2.edu.metropolia.fi/restaurant/api/v1/users/available/${username}`
    );
    return response;
  } catch (error) {
    console.log(error);
  }
}

async function createUser(usern, passwor, emai) {
  try {
    let response = await fetch(
      `https://media2.edu.metropolia.fi/restaurant/api/v1/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: usern,
          password: passwor,
          email: emai,
        }),
      }
    );
    response = await response.json();
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
  }
}

async function login(usern, passwor) {
  try {
    let response = await fetch(
      `https://media2.edu.metropolia.fi/restaurant/api/v1/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: usern,
          password: passwor,
        }),
      }
    );
    response = await response.json();
    sessionStorage.setItem('token', response.token);
    //const token = sessionStorage.getItem('token');
    //console.log(token);

    console.log(response);
    renderPage();
    document.querySelector('#logregdialog').close();
    return response;
  } catch (error) {
    console.log(error);
  }
}

async function getUserbyToken(token) {
  try {
    let response = await fetch(
      'https://media2.edu.metropolia.fi/restaurant/api/v1/users/token',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }
    response = await response.json();
    return response;
  } catch (error) {
    console.log(error);
  }
}

document.querySelector('#reg').addEventListener('click', async (e) => {
  e.preventDefault();
  const name = document.querySelector('#name').value;
  const password = document.querySelector('#password').value;
  const email = document.querySelector('#email').value;
  document.querySelector('#nameerror').textContent = '';
  document.querySelector('#passworderror').textContent = '';
  document.querySelector('#emailerror').textContent = '';

  if (name == '') {
    document.querySelector('#nameerror').textContent = 'input a username';
    return;
  }
  if (name.length < 3) {
    document.querySelector('#nameerror').textContent = 'name too short';
    return;
  }
  if (password == '') {
    document.querySelector('#passworderror').textContent = 'input a password';
    return;
  }
  if (password.length < 5) {
    document.querySelector('#passworderror').textContent = 'password too short';
    return;
  }
  if (email == '') {
    document.querySelector('#emailerror').textContent = 'input a email';
    return;
  }
  let boolvalue = await checkUserNameAvailability(name);
  boolvalue = await boolvalue.json();
  console.log(boolvalue);
  if (!boolvalue.available) {
    document.querySelector('#nameerror').textContent = 'username is taken';
    return;
  }

  const result = await createUser(name, password, email);
  console.log(result);
});

document.querySelector('#log').addEventListener('click', async (e) => {
  e.preventDefault();
  const name = document.querySelector('#name').value;
  const password = document.querySelector('#password').value;
  document.querySelector('#nameerror').textContent = '';
  document.querySelector('#passworderror').textContent = '';
  document.querySelector('#emailerror').textContent = '';

  let boolvalue = await checkUserNameAvailability(name);
  boolvalue = await boolvalue.json();
  console.log(boolvalue);
  if (boolvalue.available) {
    document.querySelector('#nameerror').textContent = `username doesn't exist`;
    return;
  }
  await login(name, password);
});

async function getDaily(id) {
  try {
    const response = await fetch(
      `https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants/daily/${id}/en`
    );
    const menu = await response.json();
    return menu;
  } catch (error) {
    console.log(error);
  }
}

async function getWeekly(id) {
  try {
    const response = await fetch(
      `https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants/weekly/${id}/en`
    );
    const menu = await response.json();
    return menu;
  } catch (error) {
    console.log(error);
  }
}

async function getRestaurant(id) {
  try {
    const response = await fetch(
      `https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants/${id}`
    );
    const restaurant = await response.json();
    return restaurant;
  } catch (error) {
    console.log(error);
  }
}

async function showRestaurantMenu(restaurantId) {
  for (let k of document.querySelectorAll('tr')) {
    k.classList.remove('highlight');
  }
  const row = document.querySelector(`tr[data-id="${restaurantId}"]`);
  const nextRow = row.nextElementSibling;

  row.classList.add('highlight');
  nextRow.classList.add('highlight');

  if (nextRow.style.display === 'table-row') {
    nextRow.style.display = 'none';
  } else {
    nextRow.style.display = 'table-row';
  }

  const daily2 = await getDaily(restaurantId);

  console.log(daily2);
  let menuHtml = `
  <td colspan="2">
    <table id="menuTable">
      <tr>
        <td>course name</td>
        <td>price</td>
        <td>diets</td>
      </tr>
      ${daily2.courses
        .map(
          (course) =>
            `<tr><td>${course.name}</td><td>${course.price}</td><td>${course.diets}</td></tr>`
        )
        .join('')}
    </table>
  </td>
`;

  nextRow.innerHTML = menuHtml;

  const buttonRow = document.createElement('tr');
  const buttonCell = document.createElement('td');
  buttonCell.colSpan = 3;

  const weeklyButton = document.createElement('button');
  weeklyButton.textContent = 'weekly';
  weeklyButton.id = 'weeklyButton';

  let infobtn = document.createElement('button');
  infobtn.textContent = 'info';

  infobtn.addEventListener('click', async () => {
    let infodialog = document.querySelector('#info');
    let infoVariable = await getRestaurant(restaurantId);

    infodialog.innerHTML = `<ul><li>Name: ${infoVariable.name}</li><li>Address: ${infoVariable.address}</li><li>City: ${infoVariable.city}</li><li>Phone: ${infoVariable.phone}</li><li>Company: ${infoVariable.company}</li></ul>`;

    const closeButton2 = document.createElement('button');
    closeButton2.textContent = 'close';
    closeButton2.addEventListener('click', () => {
      infodialog.close();
    });
    infodialog.appendChild(closeButton2);

    infodialog.showModal();
  });

  weeklyButton.addEventListener('click', async () => {
    const weeklyMenu = await getWeekly(restaurantId);
    console.log(weeklyMenu);
    const weeklyDialog = document.querySelector('#Weekly');

    let weeklyhtml = '<h2>Weekly Menu</h2>';
    weeklyMenu.days.forEach((day) => {
      weeklyhtml += `<h3>${day.date}</h3><ul>`;
      day.courses.forEach((course) => {
        weeklyhtml += `<li><strong>${course.name}</strong>`;
        if (course.price) weeklyhtml += ` - ${course.price}`;
        if (course.diets.length > 0)
          weeklyhtml += `<br>Diet: ${course.diets.join(', ')}`;
        weeklyhtml += `</li>`;
      });
      weeklyhtml += '</ul>';
    });

    weeklyDialog.innerHTML = weeklyhtml;

    const closeButton1 = document.createElement('button');
    closeButton1.textContent = 'close';
    closeButton1.addEventListener('click', () => {
      weeklyDialog.close();
    });
    weeklyDialog.appendChild(closeButton1);

    weeklyDialog.showModal();
  });

  buttonCell.appendChild(weeklyButton);
  buttonCell.appendChild(infobtn);
  buttonRow.appendChild(buttonCell);

  const menuTable = nextRow.querySelector('#menuTable');
  menuTable.appendChild(buttonRow);
}

async function getRestaurants() {
  try {
    const response = await fetch(
      'https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants'
    );

    const restaurants = await response.json();

    restaurants.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    for (let i of restaurants) {
      const marker = L.marker([
        i.location.coordinates[1],
        i.location.coordinates[0],
      ]).addTo(map);

      marker.on('add', function () {
        marker._icon.dataset.id = i._id;
      });

      let tr = document.createElement('tr');
      tr.innerHTML = `<td>${i.name}</td> <td>${i.address}</td>`;
      tr.dataset.id = i._id;

      let tr2 = document.createElement('tr');
      tr2.classList.add('hidden-row');

      tr.addEventListener('click', () => showRestaurantMenu(i._id));
      marker.on('click', () => showRestaurantMenu(i._id));

      tr.addEventListener('click', () =>
        map.flyTo([i.location.coordinates[1], i.location.coordinates[0]], 18)
      );
      marker.on('click', () =>
        map.flyTo([i.location.coordinates[1], i.location.coordinates[0]], 18)
      );

      marker.on('click', () => {
        const row = document.querySelector(`tr[data-id="${i._id}"]`);
        if (!row) return;

        row.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      });

      table.appendChild(tr);
      table.appendChild(tr2);
    }
  } catch (error) {
    console.log(error);
  }
}

document.querySelector('#logoutbtn').addEventListener('click', () => {
  sessionStorage.removeItem('token');
  renderPage();
});

async function renderPage() {
  getRestaurants();
  let tokenvalid = await getUserbyToken(sessionStorage.getItem('token'));
  console.log(tokenvalid);
  if (tokenvalid) {
    document.querySelector('#logregbtn').style.display = 'none';
    document.querySelector('#logoutbtn').style.display = 'block';
  } else {
    document.querySelector('#logregbtn').style.display = 'block';
    document.querySelector('#logoutbtn').style.display = 'none';
  }
}

renderPage();
