const fs = require('fs');
const path = require('path');

function searchSync(dir, searchString, fileList = []) {
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        try {
            fileList = searchSync(dirFile, searchString, fileList);
        }
        catch (err) {
            if (err.code === 'ENOTDIR' || err.code === 'EBUSY') {
                const data = fs.readFileSync(dirFile);
                    if(data.indexOf(searchString) >= 0){
                        fileList = [...fileList, dirFile];
                    }
            } else {
                throw err;
            }
        }
    });
    return fileList;
}

console.log(searchSync('./test', 'Lorem'));