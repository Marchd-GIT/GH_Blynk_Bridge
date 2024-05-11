/**
 * Функция проходится по дереву объекта и собирает объекты с найденными значениями ключа 'id' и их путями в исходном дереве.
 * @param {object|array} obj - Объект или массив, в котором нужно найти ключ 'id'.
 * @param {string[]} [path=[]] - Массив для хранения пути к текущему объекту.
 * @returns {array} - Массив объектов с найденными значениями ключа 'id' и их путями.
 */
function findObjectsWithIds(obj, path = [], f_key, f_value) {
    const result = [];
    // Проверяем, является ли переданный объект массивом
    if (Array.isArray(obj)) {
        // Если да, проходимся по каждому элементу массива
        obj.forEach((item, index) => {
            // Рекурсивно вызываем функцию для каждого элемента массива, добавляя индекс в путь
            findObjectsWithIds(item, path.concat(index), f_key, f_value).forEach(res => result.push(res));
        });
    } else if (typeof obj === 'object' && obj !== null) {
        // Если переданный объект не является массивом, проходимся по его ключам
        Object.keys(obj).forEach(key => {
            // Если текущий ключ равен 'id', добавляем объект с найденным значением и путем в результат
            if (key === f_key) {
                if(f_value === obj[f_key]){
                    let res = obj;
                    obj['path'] = path.slice()
                    result.push(obj);
                }
            } else {
                // Рекурсивно вызываем функцию для значений ключей, если это объект или массив,
                // добавляя ключ в путь
                findObjectsWithIds(obj[key], path.concat(key), f_key, f_value).forEach(res => result.push(res));
            }
        });
    }
    // Возвращаем массив объектов с найденными значениями ключа 'id' и их путями
    return result;
}

/**
 * Функция записывает данные в объект по указанному пути в виде массива.
 * @param {object} obj - Объект, в который нужно записать данные.
 * @param {array} path - Путь к месту записи данных в виде массива.
 * @param {*} value - Значение, которое нужно записать.
 */
function writeToPath(obj, path, value) {
    // Для каждого ключа из пути
    for (let i = 0; i < path.length; i++) {
        const key = path[i];
        // Если это последний ключ в пути
        if (i === path.length - 1) {
            // Записываем значение по последнему ключу
            obj[key] = value;
        } else {
            // Если ключ не существует, создаем пустой объект или массив в зависимости от следующего ключа
            if (obj[key] === undefined || obj[key] === null) {
                obj[key] = typeof path[i + 1] === 'number' ? [] : {};
            }
            // Переходим к следующему уровню объекта
            obj = obj[key];
        }
    }
}


module.exports.findObjectsWithIds = findObjectsWithIds;
module.exports.writeToPath = writeToPath;