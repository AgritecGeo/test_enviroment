document.addEventListener('DOMContentLoaded', function() {
    cargarImagenesDesdeCSV();
    document.getElementById('accion').addEventListener('click', filtrarPorPais);
});

function cargarImagenesDesdeCSV() {
    fetch('tabla_documentacion.csv')
        .then(response => response.text())
        .then(csvText => {
            window.imagenes = parseCSV(csvText);
            mostrarImagenes(window.imagenes);
        })
        .catch(err => console.error('Error al cargar y parsear el CSV:', err));
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines.shift().split(',');

    return lines.map(line => {
        const data = line.split(',');
        return headers.reduce((obj, nextKey, index) => {
            obj[nextKey] = data[index];
            return obj;
        }, {});
    });
}

function mostrarImagenes(data) {
    const imgContainer = document.getElementById('img-container');
    imgContainer.innerHTML = '';
    window.imagenesFiltradas = data.filter(imagen => !imagen.evaluador); // Filtrar solo las imágenes que no han sido evaluadas

    window.imagenesFiltradas.forEach((imagen, index) => {
        const imgDiv = document.createElement('div');
        imgDiv.classList.add('img-box');
        const imageURL = `https://filedn.com/lRAMUKU4tN3HUnQqI5npg4H/Plantix/Imagenes/imagen_${imagen['ID']}.png`;
        imgDiv.innerHTML = `
            <div>Nombre: imagen_${imagen['ID']}.png</div>
            <div>País: ${imagen['pais']}</div>
            <a href="${imageURL}" target="_blank"><img src="${imageURL}" alt="Imagen" class="image"></a>
            <textarea placeholder="Añade un comentario..."></textarea>
            <button onclick="guardarComentario(${index})">Guardar</button>
        `;
        imgContainer.appendChild(imgDiv);
    });
}

function filtrarPorPais() {
    const paisSeleccionado = document.getElementById('pais').value;
    const imagenesFiltradasPorPais = window.imagenesFiltradas.filter(imagen => imagen.pais === paisSeleccionado || paisSeleccionado === 'default');
    mostrarImagenes(imagenesFiltradasPorPais);
}

function guardarComentario(index) {
    const imagen = window.imagenesFiltradas[index];
    const comentario = document.querySelectorAll('.img-box')[index].querySelector('textarea').value;
    const evaluador = document.getElementById('evaluador').value;
    const fecha = new Date().toISOString();

    const datosCSV = `Nombre_Imagen,País,Fecha,Comentario,Evaluador\n"${imagen['ID']}","${imagen['pais']}","${fecha}","${comentario}","${evaluador}"`;

    fetch('https://filedn.com/lRAMUKU4tN3HUnQqI5npg4H/Plantix/Evaluación%20de%20Respuestas/', {
        method: 'POST',
        body: datosCSV,
        headers: {
            'Content-Type': 'text/csv'
        }
    })
    .then(response => {
        if (response.ok) {
            console.log('Evaluación guardada correctamente.');
            // Mostrar banner de confirmación
            document.getElementById('banner').style.display = 'block';
        } else {
            console.error('Error al guardar la evaluación.');
        }
    })
    .catch(err => console.error('Error al guardar la evaluación:', err));
}
