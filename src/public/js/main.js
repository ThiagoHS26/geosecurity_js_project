// Inicializar el mapa
var mymap = L.map('mapid').setView([-1.6639932,-78.6465081], 13);

// Añadir capa de mapa de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

//Añadir los puntos de referencia al mapa
let crimeMarkers = [];
fetch('/api/crimes/list')
  .then(response => response.json())
  .then(data => {
    data.forEach(crime => {
      const marker = L.marker([crime.location.coordinates[1], crime.location.coordinates[0]])
        .addTo(mymap)
        .on('click', function() {
          // Mostrar la ventana modal con la información del crimen
          getCriminalCaseById(crime._id);
          document.getElementById('modalLabel').innerText = `Información del crimen: ${crime.type}`;
          document.getElementById('modalBody').innerHTML = `
            <b>Tipo:</b> ${crime.type}<br>
            <b>Fecha:</b> ${new Date(crime.date).toLocaleDateString()}<br>
            <b>Descripción:</b> ${crime.description}
          `;
          $('#crimeModalView').modal('show');
        });
      
      crimeMarkers.push(marker);
    });

    if (crimeMarkers.length > 0) {
      const group = new L.featureGroup(crimeMarkers);
      mymap.fitBounds(group.getBounds());
    }
  })
  .catch(error => {
    console.error('Error fetching crimes:', error);
});

// Función para obtener los datos de un crimen por ID
function getCriminalCaseById(id) {
  fetch(`/api/crimes/getOne/${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error fetching crime data');
      }
      return response.json();
    })
    .then(data => {
      localStorage.setItem('idMarker',data._id);
      const currentData = JSON.stringify(data);
      localStorage.setItem('currentData',currentData);
    })
    .catch(error => {
      console.error('Error:', error);
  });
}

//Funcion para eliminar un punto del mapa
document.getElementById('btnDeleteMarker').addEventListener('click', function(event){
  event.preventDefault();
  const id = localStorage.getItem('idMarker');
  fetch(`/api/crimes/delete/${id}`,{
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) { throw new Error('Error deleting crime marker');}
    })
    .then(()=>{
      alert("El punto ha sido removido!");
      localStorage.removeItem('idMarker');
      //Recargar la página para que los cambios se vean reflejados
      location.reload();
      const marker = crimeMarkers.find(m => m.options.title === id);
      if (marker) {
        mymap.removeLayer(marker);
      }
    })
    .catch(error => {
      console.log('Error:',error);
    })
});

// Función para generar colores diferentes para los clusters
function getClusterColor(clusterIndex) {
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  return colors[clusterIndex % colors.length];
}

//Completar el formulario para ingreso de nuevos registros de crimenes
document.getElementById('crimeForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const type = document.getElementById('type').value;
  const latitude = parseFloat(document.getElementById('latitude').value);
  const longitude = parseFloat(document.getElementById('longitude').value);
  const date = document.getElementById('date').value;
  const description = document.getElementById('description').value;

  fetch('/api/crimes/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      date,
      description
    })
  })
  .then(response => response.json())
  .then(data => {
    // Success message
    alert('Registro exitoso!');
    // Resetear el formulario
    document.getElementById('crimeForm').reset();
    location.reload();
  })
  .catch(error => {
    console.error('Error:', error);
  });
});

//Agregar una carga masiva de datos en formato .xlsx
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bulkUploadForm');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();  // Evita la recarga de la página al enviar el formulario

    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];

    // Validación del archivo
    if (!file) {
      alert('Por favor selecciona un archivo .xlsx');
      return;
    }

    if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      alert('El archivo seleccionado no es un archivo .xlsx válido');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);  // Añade el archivo al FormData

    try {
      // Muestra un mensaje de carga en progreso
      const loadingMessage = document.createElement('p');
      loadingMessage.textContent = 'Cargando archivo, por favor espera...';
      form.appendChild(loadingMessage);

      // Envía la solicitud POST al servidor
      const response = await fetch('/api/crimes/uploadData', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();  // Analiza la respuesta del servidor

      if (response.ok) {
        alert('Archivo procesado exitosamente y datos cargados en MongoDB');
        console.log(result);  // Opcional: maneja la respuesta del servidor
        form.reset();  // Resetea el formulario
      } else {
        alert('Error al procesar el archivo: ' + result.message);
        console.error('Error del servidor:', result.error);
      }
    } catch (error) {
      console.error('Error en el envío:', error);
      alert('Ocurrió un error al intentar cargar el archivo.');
    } finally {
      // Remueve el mensaje de carga
      if (loadingMessage) {
        loadingMessage.remove();
      }
    }
  });
});

// Obtener y visualizar los crímenes agrupados en el mapa
fetch('/api/crimes/clusters')
  .then(response => response.json())
  .then(data => {
    data.clusteredCrimes.forEach((cluster, index) => {
      const color = getClusterColor(index); // Función para generar colores diferentes

      cluster.forEach(crime => {
        L.circleMarker([crime.location.coordinates[1], crime.location.coordinates[0]], {
          color: color,
          radius: 8
        })
        .addTo(mymap)
        .bindPopup(`<b>${crime.type}</b><br>${crime.date}`);
      });
    });
  })
  .catch(error => {
    console.error('Error fetching clusters:', error);
});

//Editar el marcador seleccionado
//Completar el formulario con la informacion actual
document.getElementById('btnEditMarker').addEventListener('click',function(event){
  event.preventDefault();
  //Recuperar datos de localStorage
  const id = localStorage.getItem('idMarker');
  const currentData = JSON.parse(localStorage.getItem('currentData'));
  //Cerrar el modal 
  $('#crimeModalView').modal('hide');
  //Limpiar el formulario
  document.getElementById('editCrimeForm').reset();
  document.getElementById('editType').value = currentData.type;
  document.getElementById('editLat').value = currentData.location.coordinates[1];
  document.getElementById('editLng').value = currentData.location.coordinates[0];
  document.getElementById('editDate').value = new Date(currentData.date).toISOString().split('T')[0];
  document.getElementById('editDesc').value = currentData.description;
  $('#editCrimeModal').modal('show');
});

document.getElementById('editCrimeForm').addEventListener('submit',function(event){
  event.preventDefault();
  //Recuperar datos del formulario
  const id = localStorage.getItem('idMarker');
  const type = document.getElementById('editType').value;
  const latitude = parseFloat(document.getElementById('editLat').value);
  const longitude = parseFloat(document.getElementById('editLng').value);
  const date = document.getElementById('editDate').value;
  const description = document.getElementById('editDesc').value;

  fetch(`/api/crimes/update/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      date,
      description
    })
  })
 .then(response => response.json())
 .then(data => {
    alert('Registro editado exitosamente!');
    location.reload();
    const marker = crimeMarkers.find(m => m.options.title === id);
    if (marker) {
      marker.setLatLng([latitude, longitude]);
      marker.bindPopup(`<b>${type}</b><br>${date}`);
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
});



