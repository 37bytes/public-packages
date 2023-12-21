const fs = require('fs');

// Функция для замены строк в файлах
function replaceInFile(filePath: string, dynamicEnvironment: object) {
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }

        const result = data.replace(/"__PLACE_FOR_DYNAMIC_ENVIRONMENT__"/g, JSON.stringify(dynamicEnvironment));

        fs.writeFile(filePath, result, 'utf8', function (err) {
            if (err) {
                console.log(err);
            }
        });
    });
}

export default replaceInFile;
