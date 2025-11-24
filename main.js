const map = L.map('map').setView([60.1695, 24.933], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const table = document.querySelector('#maintable');

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
    const response = await fetch(
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
    return response;
  } catch (error) {
    console.log(error);
  }
}

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
        const row = document.querySelector(`tr[data-id="${id}"]`);
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

getRestaurants();
