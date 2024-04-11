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
            // Normaliza la respuesta para asegurarse de que siempre sea un array
            const normalizedData = Array.isArray(data) ? data : [data];
            window.imagenes = normalizedData;
            mostrarImagenes(normalizedData);
        })
        .catch(err => console.error('Error al cargar las imágenes desde GCP:', err));
}

// Función para mostrar las imágenes en la página
function mostrarImagenes(data) {
    const imgContainer = document.getElementById('img-container');
    imgContainer.innerHTML = '';

    data.forEach((imagen, index) => {
        const imgDiv = document.createElement('div');
        imgDiv.classList.add('img-box');
        const imageURL = imagen.url_imagen;
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
    if (!window.imagenes) {
        console.error('No hay imágenes disponibles para filtrar');
        return;
    }
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
        // Consider adding user feedback here as well.
    });
}
