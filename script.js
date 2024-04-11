document.addEventListener('DOMContentLoaded', function() {
    cargarImagenesDesdeGCP();
    document.getElementById('accion').addEventListener('click', filtrarPorPais);
});

// Función para cargar las imágenes desde la API en GCP
function cargarImagenesDesdeGCP() {
    fetch('https://us-central1-agritecgeo-analytics.cloudfunctions.net/plantix-evaluate-photo')
        .then(response => response.json())
        .then(data => {
            // Guardar imágenes globalmente si se necesita para filtrar
            window.imagenes = data;
            mostrarImagenes(data);
        })
        .catch(err => console.error('Error al cargar las imágenes desde GCP:', err));
}

// Función para mostrar las imágenes en la página
function mostrarImagenes(data) {
    const imgContainer = document.getElementById('img-container');
    imgContainer.innerHTML = ''; // Limpia el contenedor antes de añadir nuevas imágenes

    data.forEach((imagen, index) => {
        const imgDiv = document.createElement('div');
        imgDiv.classList.add('img-box');
        const imageURL = imagen.url_imagen; // Asume que cada 'imagen' tiene una propiedad 'url_imagen'
        imgDiv.innerHTML = `
            <div>Nombre: ${imagen.nombre}</div>
            <div>País: ${imagen.pais}</div>
            <a href="${imageURL}" target="_blank"><img src="${imageURL}" alt="Imagen" class="image"></a>
            <textarea placeholder="Añade un comentario..."></textarea>
            <button onclick="guardarComentario(${index})">Guardar</button>
        `;
        imgContainer.appendChild(imgDiv);
    });
}

// Función para filtrar imágenes por país seleccionado en un dropdown
function filtrarPorPais() {
    const paisSeleccionado = document.getElementById('pais').value;
    const imagenesFiltradas = window.imagenes.filter(imagen => imagen.pais === paisSeleccionado || paisSeleccionado === 'default');
    mostrarImagenes(imagenesFiltradas);
}

// Función para guardar el comentario de una imagen específica
function guardarComentario(index) {
    const imagen = window.imagenes[index];
    const comentario = document.querySelectorAll('.img-box')[index].querySelector('textarea').value;
    const evaluador = document.getElementById('evaluador').value;
    const fecha = new Date().toISOString();

    const datosParaEnviar = {
        image_id: imagen.id,
        pais: imagen.pais,
        fecha: fecha,
        comment: comentario,
        evaluador: evaluador
    };

    // Cambia esta URL a la de tu función específica para guardar comentarios en GCP
    fetch('https://us-central1-agritecgeo-analytics.cloudfunctions.net/plantix-save-comment', {
        method: 'POST',
        body: JSON.stringify(datosParaEnviar),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            console.log('Comentario guardado correctamente.');
            document.getElementById('banner').style.display = 'block'; // Asumiendo que existe un banner de confirmación
            setTimeout(() => document.getElementById('banner').style.display = 'none', 3000);
        } else {
            console.error('Error al guardar el comentario.');
        }
    })
    .catch(err => console.error('Error al guardar el comentario:', err));
}
