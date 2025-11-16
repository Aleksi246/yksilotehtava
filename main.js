const map = L.map('map').setView([60.1695, 24.933], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const table = document.querySelector('table');

const dialog = document.querySelector('dialog');

const button = document.createElement('button');
button.innerText = 'close';

button.addEventListener('click', () => {
  dialog.innerHTML = '';
  dialog.close();
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

async function showRestaurantInfo(restaurantId) {
  for (let k of document.querySelectorAll('tr')) {
    k.classList.remove('highlight');
  }
  const row = document.querySelector(`tr[data-id="${restaurantId}"]`);
  row.classList.add('highlight');

  const daily2 = await getDaily(restaurantId);

  dialog.innerHTML = '';

  if (daily2.courses.length !== 0) {
    console.log(daily2);
    let menu = `<table><tr> <td>course name</td> <td>price</td> <td>diets</td> </tr>`;
    for (let course of daily2.courses) {
      menu += `<tr> <td>${course.name}</td><td>${course.price}</td><td>${course.diets}</td> </tr>`;
    }
    menu += '</table>';
    dialog.innerHTML = menu;
  }

  //let innerhtml2 = `<p>${i.name}</p> <p>${i.address}</p> <p>${i.postalCode}</p> <p>${i.city}</p> <p>${i.phone}</p> <p>${i.company}</p>`;

  //dialog.innerHTML += innerhtml2;
  dialog.appendChild(button);
  dialog.showModal();
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

      tr.addEventListener('click', () => showRestaurantInfo(i._id));

      // Marker click
      marker.on('click', () => showRestaurantInfo(i._id));
      /*
      tr.addEventListener('click', async () => {
        for (let k of document.querySelectorAll('tr')) {
          k.classList.remove('highlight');
        }
        tr.classList.add('highlight');

        let daily2 = await getDaily(i._id);
        if (daily2.courses.length !== 0) {
          console.log(daily2);
          let menu = `<table><tr> <td>course name</td> <td>price</td> <td>diets</td> </tr>`;
          for (let course of daily2.courses) {
            menu += `<tr> <td>${course.name}</td><td>${course.price}</td><td>${course.diets}</td> </tr>`;
          }
          menu += '</table>';
          dialog.innerHTML = menu;
        }

        let innerhtml2 = `<p>${i.name}</p> <p>${i.address}</p> <p>${i.postalCode}</p> <p>${i.city}</p> <p>${i.phone}</p> <p>${i.company}</p>`;

        dialog.innerHTML += innerhtml2;
        dialog.appendChild(button);
        dialog.showModal();
      });
*/

      table.appendChild(tr);
    }
  } catch (error) {
    console.log(error);
  }
}

getRestaurants();
