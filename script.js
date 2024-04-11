document.addEventListener('DOMContentLoaded', function() {
    cargarImagenesDesdeGCP();
    document.getElementById('accion').addEventListener('click', filtrarPorPais);
});

// Función para cargar las imágenes desde la API en GCP
function cargarImagenesDesdeGCP() {
    fetch('https://us-central1-agritecgeo-analytics.cloudfunctions.net/plantix-evaluate-photo')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Asegúrate de que data es un array y utiliza esos datos para mostrar imágenes
            const imagenes = Array.isArray(data) ? data : [];
            window.imagenes = imagenes;  // Almacenar globalmente para uso en filtrado
            mostrarImagenes(imagenes);
        })
        .catch(err => console.error('Error al cargar las imágenes desde GCP:', err));
}

// Función para mostrar las imágenes en la página
function mostrarImagenes(imagenes) {
    const imgContainer = document.getElementById('img-container');
    imgContainer.innerHTML = '';

    imagenes.forEach(imagen => {
        const imgDiv = document.createElement('div');
        imgDiv.classList.add('img-box');
        const imageURL = imagen.url_imagen || 'https://via.placeholder.com/150'; // Proporcionar una imagen por defecto
        imgDiv.innerHTML = `
            <div>Nombre: ${imagen.nombre || 'Desconocido'}</div>
            <div>País: ${imagen.pais || 'Desconocido'}</div>
            <a href="${imageURL}" target="_blank"><img src="${imageURL}" alt="Imagen de ${imagen.cultivo || 'Cultivo Desconocido'}" class="image"></a>
            <textarea placeholder="Añade un comentario..."></textarea>
            <button onclick="guardarComentario('${imagen.id}')">Guardar</button>
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
function guardarComentario(imageId) {
    const imgBox = document.querySelector(`button[onclick="guardarComentario('${imageId}')"]`).parentNode;
    const comentario = imgBox.querySelector('textarea').value;
    const evaluador = document.getElementById('evaluador').value;
    const fecha = new Date().toISOString();

    const datosParaEnviar = {
        image_id: imageId,
        pais: imgBox.querySelector('div:nth-child(2)').textContent.replace('País: ', ''),
        fecha: fecha,
        comment: comentario,
        evaluador: evaluador
    };

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
            document.getElementById('banner').style.display = 'block';
            setTimeout(() => document.getElementById('banner').style.display = 'none', 3000);
        } else {
            throw new Error('Error al guardar el comentario.');
        }
    })
    .catch(err => {
        console.error('Error al guardar el comentario:', err);
    });
}
