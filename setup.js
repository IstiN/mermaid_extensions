const fs = require('fs');
const path = require('path');

/**
 * Recursively copies a directory.
 * @param {string} src The source directory.
 * @param {string} dest The destination directory.
 */
function copyDirRecursive(src, dest) {
    const exists = fs.existsSync(src);
    if (!exists) {
        console.error(`Source directory not found: ${src}`);
        return;
    }
    
    const stats = fs.statSync(src);
    const isDirectory = stats.isDirectory();
    
    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(child => {
            copyDirRecursive(path.join(src, child), path.join(dest, child));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

const sharedDirs = ['shared', 'popup'];
const extensionDirs = ['chrome', 'safari'];

/**
 * Main setup function to prepare extension directories.
 */
function setup() {
    console.log('Starting extension setup...');
    
    for (const dir of extensionDirs) {
        console.log(`\nSetting up for: ${dir}`);
        for (const shared of sharedDirs) {
            const source = path.resolve(__dirname, shared);
            const destination = path.resolve(__dirname, dir, shared);
            
            // Remove old directory if it exists to ensure a clean copy
            if (fs.existsSync(destination)) {
                fs.rmSync(destination, { recursive: true, force: true });
                console.log(`  - Removed old directory: ${dir}/${shared}`);
            }
            
            // Copy new directory
            copyDirRecursive(source, destination);
            console.log(`  - Copied '${shared}' to '${dir}/${shared}'`);
        }
    }
    
    console.log('\n✅ Setup complete!');
    console.log('You can now load the extensions from the `chrome/` and `safari/` directories respectively.');
    console.log('Remember to "Reload" the extension in your browser to see the changes.');
}

// Run the setup
setup();
