const fs = require("fs");
const child_process = require("child_process");
const { exit } = require("process");

const args = process.argv.slice(2)[0];
let verbose = false;
const execSync = child_process.execSync;
const rootdir = execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trimEnd();

if (args === '-h') {
    usage();
    exit(0);
}

if (args === '-v') {
    verbose = true;
}

function usage() {
    console.log(`This script installs the git-hooks from ${rootdir}/common/git-hooks folder to ${rootdir}/.git/hooks folder\n`);
    console.log('   -h  print help screen');
    console.log('   -v  verbose mode');
}

function permissions(mode, file, dst) {
    try {
        const fd = fs.openSync(dst, "r");
        fs.fchmodSync(fd, mode);
        if (verbose) {console.log(`Write permissions updated for ${file}`);}
      } catch (error) {
        console.log(error);
      }
}

const srcDir = `${rootdir}/common/git-hooks`;
const dstDir = `${rootdir}/.git/hooks`;
const files = fs.readdirSync(srcDir);

/**
 * Create dstDir if it doesnot exist
 * @param destination Directory
 */
if (!fs.existsSync(dstDir)) {
    fs.mkdirSync(dstDir);
}

files.forEach(file => {
    const src = `${srcDir}/${file}`;
    const dst = `${dstDir}/${file}`;
    if (!fs.existsSync(dst)) {fs.appendFileSync(dst, '', { encoding: "utf8", flag: "w" })};
    permissions(0o700, file, dst);
    fs.copyFileSync(src, dst);
    if (verbose) {console.log(`${file} copy successful !`);}
    permissions(0o500, file, dst);
});