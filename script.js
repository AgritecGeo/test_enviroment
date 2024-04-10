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
    window.imagenesFiltradas = data; // Almacenar las imágenes filtradas para su uso en guardarComentario.

    data.forEach((imagen, index) => {
        const imgDiv = document.createElement('div');
        imgDiv.classList.add('img-box');
        const imageURL = `https://filedn.com/lRAMUKU4tN3HUnQqI5npg4H/Plantix/Imagenes/imagen_${imagen['id']}.png`;
        imgDiv.innerHTML = `
            <div>Nombre: imagen_${imagen['id']}.png</div>
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
    const imagenesFiltradas = window.imagenes.filter(imagen => imagen.pais === paisSeleccionado || paisSeleccionado === 'default');
    mostrarImagenes(imagenesFiltradas);
}

function guardarComentario(index) {
    const imagen = window.imagenesFiltradas ? window.imagenesFiltradas[index] : window.imagenes[index];
    const comentario = document.querySelectorAll('.img-box')[index].querySelector('textarea').value;
    const evaluador = document.getElementById('evaluador').value;
    const fecha = new Date().toISOString();

    const datosCSV = `Nombre Imagen,País,Fecha,Comentario,Evaluador\n"${imagen['id']}","${imagen['pais']}","${fecha}","${comentario}","${evaluador}"`;

    const blob = new Blob([datosCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluacion_${imagen['id']}.csv`; // Asegura que el nombre del archivo sea único
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
