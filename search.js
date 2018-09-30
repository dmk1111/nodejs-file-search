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
                if (data.indexOf(searchString) >= 0) {
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

function searchAsync(dir, searchString, done) {
    let results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        let pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function (file) {
            file = path.join(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    searchAsync(file, searchString, function (err, res) {
                        results = [...results, ...res];
                        if (!--pending) {
                            done(null, results);
                        }
                    });
                } else {
                    const stream = fs.createReadStream(file);
                    stream.on('data', (chunk) => {
                        if (chunk.indexOf(searchString) >= 0) {
                            results.push(file);
                            stream.close();
                        }
                    });
                    stream.on('close', () => {
                        if (!--pending) {
                            done(null, results);
                        }
                    });
                }
            });
        });
    });
}

searchAsync('./test', 'Lorem', function(err, results) {
    if (err) throw err;
    console.log(results);
});