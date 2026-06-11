const fs = require('fs');

function scanFile(filename) {
    const content = fs.readFileSync(filename, 'utf8');
    
    // Extract CSS classes from <style>
    const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/);
    if (!styleMatch) return;
    const styleContent = styleMatch[1];
    
    // Find all class selectors (starting with .)
    const classRegex = /\.([a-zA-Z0-9_-]+)/g;
    const classes = new Set();
    let match;
    while ((match = classRegex.exec(styleContent)) !== null) {
        // Exclude pseudo-classes or decimals
        if (!match[1].match(/^[0-9]/)) {
            classes.add(match[1]);
        }
    }
    
    // Check if classes are used in HTML or JS
    const htmlContent = content.replace(/<style>[\s\S]*?<\/style>/, '');
    const unusedClasses = [];
    
    for (const cls of classes) {
        // Exclude some common keywords that might be false positives
        if (['html', 'body', 'active', 'hidden', 'grabbing', 'paused', 'ok', 'err', 'leave-up', 'wait-above', 'wait-below', 'is-active'].includes(cls)) continue;
        
        const inHtml = htmlContent.includes(`"${cls}"`) || htmlContent.includes(`'${cls}'`) || htmlContent.includes(` ${cls} `) || htmlContent.includes(` ${cls}"`) || htmlContent.includes(`"${cls} `);
        const inJs = htmlContent.includes(cls); // simple string match
        
        if (!inJs) {
            unusedClasses.push(cls);
        }
    }
    
    console.log(`Unused classes in ${filename}:`, unusedClasses.join(', '));
}

scanFile('index.html');
scanFile('intelligent-farm-surveillance.html');
