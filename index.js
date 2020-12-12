// Execute all JS files using Line
// Import lang
// Read .trade files
// Decouple files into lines
// Apply rules to match funcs
// Execute funcs

const path = require("path");
const fs = require("fs");
const readline = require('readline');

const green = "\x1b[32m";
const white = "\x1b[37m";

const asyncFilter = async (arr, predicate) => {
	const results = await Promise.all(arr.map(predicate));
	return arr.filter((_v, index) => results[index]);
}

const getFilePaths = async function (startPath, filter, filepaths) {
    if (!fs.existsSync(startPath)) return;

    const files = fs.readdirSync(startPath);
    let i = -1;

    while (++i < files.length) {
        const filepath = path.join(startPath, files[i]);
        const stat = fs.lstatSync(filepath);

        if (stat.isDirectory()) getFilePaths(filepath, filter, filepaths);
        else if (filepath.indexOf(filter) >= 0) filepaths.push(filepath);
    }

    return filepaths;
};

const checkFileForOccurence = async (filePath, string) => {
	const fileStream = fs.createReadStream(filePath);

	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity
	});

	for await (const line of rl)
		if (line.includes(string))
	 		return true;
	return false;
};

const filteringFilePathsUsingString = async (filePaths, string) => {
	const filter = async (filePath) => {
		const isFileContainingString = await checkFileForOccurence(filePath, string);
		return isFileContainingString;
	};

	const filtered = await asyncFilter(filePaths, filter);

	return filtered;
};

const getStratFiles = async () => {
    let jsFilePaths = await getFilePaths(path.join(__dirname, "./"), ".js", []);
	
	// Excluding this file.
	jsFilePaths = jsFilePaths.filter((fpath) => !fpath.includes(path.join(__dirname, "index.js")));
	
	let stratFiles = await filteringFilePathsUsingString(jsFilePaths, "const { Line } = ");
    return stratFiles;
};

const main = async () => {
	const stratFiles = await getStratFiles();

	console.log(stratFiles);
};

main();
