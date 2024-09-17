function formatTime(raw_time) {
    // Define un objeto para mapear las abreviaturas de tiempo a sus nombres completos
    const timeMap = {
        'w': 'semana',
        'd': 'día',
        'h': 'hora',
        'm': 'minuto'
    };

    // Divide el raw_time en componentes usando espacios como delimitador
    const splitMessages = raw_time.split(' ');

    // Almacena las partes formateadas
    let formattedParts = [];

    splitMessages.forEach(message => {
        // Extrae el valor numérico y la unidad de tiempo
        const value = parseInt(message);
        const unit = message.replace(value, '');

        if (timeMap[unit]) {
            // Usa el objeto timeMap para obtener la unidad completa
            formattedParts.push(`${value} ${timeMap[unit]}${value > 1 ? 's' : ''}`);
        }
    });

    // Une las partes formateadas con comas y 'y' antes del último elemento
    return formattedParts.join(', ').replace(/,([^,]*)$/, ' y$1');
}

module.exports = {formatTime}