const fs = require('fs').promises;
// require('dotenv').config();

const init = async (path,data) => {
    try {
        await fs.readFile(path);
    } catch (err) {
        console.log('err :>> ', err);
        if (err.code === 'ENOENT') {
            await fs.writeFile(path, JSON.stringify(data));
            console.log('Stored to', path);
        } else throw err;
    }
}

module.exports = {init}