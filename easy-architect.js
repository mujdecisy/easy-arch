const { mdToPdf } = require('md-to-pdf');
const path = require('path');
const fs = require('fs');
const readline = require('readline');


async function convert(inputPath, intermediatePath, tempDir) {
    const { run } = await import("@mermaid-js/mermaid-cli");
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir);

    // Add "../" prefix to local links
    let content = fs.readFileSync(inputPath, 'utf8');
    content = content.replace(/\]\((?!http)([^)]+)\)/g, '](../$1)');
    
    // Update content with absolute paths
    content = content.replace(/\]\(\.\.\/([^)]+)\)/g, (_, relativePath) => {
        const absolutePath = path.join(process.cwd(), relativePath);
        return `](${absolutePath})`;
    });

    // Create external folder
    const externalDir = path.join(tempDir, 'external');
    if (!fs.existsSync(externalDir)) {
        fs.mkdirSync(externalDir);
    }

    // Copy external files to the external folder
    content = content.replace(/\]\((?!http)([^)]+)\)/g, (_, relativePath) => {
        const absolutePath = path.join(process.cwd(), relativePath);
        const fileName = path.basename(absolutePath);
        const destPath = path.join(externalDir, fileName);
        fs.copyFileSync(absolutePath, destPath);
        return `](external/${fileName})`;
    });

    fs.writeFileSync(intermediatePath, content);

    await run(
        intermediatePath, intermediatePath, // {optional options},
    );

    console.log(`Converted MD created successfully at ${intermediatePath}`);
}

async function getLatestSavedTimestamp(inputPath) {
    const fileStat = fs.statSync(inputPath);
    const fileTime = fileStat.mtimeMs;
    return Math.floor(fileTime / 1000).toString();
}

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

async function initArch() {
    const name = await askQuestion("Enter project name: ");
    const version = await askQuestion("Enter project version: ");
    const author = await askQuestion("Enter author name: ");
    const today = new Date().toISOString().split('T')[0];

    const templatePath = path.join(__dirname, 'template-arch.md');
    const templateContent = fs.readFileSync(templatePath, 'utf8');

    const updatedContent = templateContent
        .replace(/!name!/g, name)
        .replace(/!version!/g, version)
        .replace(/!author!/g, author)
        .replace(/!date!/g, today);

    const outputPath = `${name}--v${version}.md`;

    fs.writeFileSync(outputPath, updatedContent);

    console.log(`Markdown file created successfully at ${outputPath}`);
}

async function initADR() {
    const today = new Date().toISOString().split('T')[0];

    const templatePath = path.join(__dirname, 'template-decision.md');
    const templateContent = fs.readFileSync(templatePath, 'utf8');

    const updatedContent = templateContent
        .replace(/!date!/g, today);

    const outputPath = `adr--${today}.md`;

    fs.writeFileSync(outputPath, updatedContent);

    console.log(`Markdown file created successfully at ${outputPath}`);
}

async function exportHtml(inputPath) {
    const fileName = path.basename(inputPath, '.md');
    const htmlDir = `${fileName}_html`;
    const intermediatePath = path.join(htmlDir, `${fileName}.md`);
    const outputPath = path.join(htmlDir, `${fileName}.html`);

    const cssPath = path.join(__dirname, 'template.css');
    const cssContent = "body {width:1025px; padding: 150px 200px 200px 100px; border: 1px solid black; font-size: 100%;}" + fs.readFileSync(cssPath, 'utf8');

    await convert(inputPath, intermediatePath, htmlDir);
    fs.writeFileSync(path.join(htmlDir, '.gitignore'), '*');

    await mdToPdf({ path: intermediatePath }, {
        dest: outputPath,
        as_html: true,
        css: cssContent,
    });

    console.log(`HTML file created successfully at ${outputPath}`);
}

async function exportPdf(inputPath) {
    const fileName = path.basename(inputPath, '.md');
    const tempDir = `${fileName}_tmp`;
    const intermediatePath = path.join(tempDir, `${fileName}.md`);
    const latestTimestampTag = await getLatestSavedTimestamp(inputPath);
    const outputPath = path.join(path.dirname(intermediatePath), `${fileName}.pdf`);

    await convert(inputPath, intermediatePath, tempDir);

    const cssPath = path.join(__dirname, 'template.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    await mdToPdf({ path: intermediatePath }, {
        dest: outputPath, css: cssContent,
        pdf_options: {
            displayHeaderFooter: true,
            headerTemplate: `
                <style>
                    section {
                        margin: 0 auto;
                        font-size: 14px;
                    }
                </style>
                <section>
                    <span>${fileName}</span>
                </section>
            `,
            footerTemplate: `
                <section>
                    <div>
                        <span class="pageNumber"></span>
                    </div>
                </section>
            `,
        }
    });

    fs.copyFileSync(outputPath, `${fileName}-${latestTimestampTag}.pdf`);
    fs.rmSync(tempDir, { recursive: true, force: true });
}

async function watch(inputPath) {
    const LOCK_FILE = `${inputPath}.lock`;
    if (fs.existsSync(LOCK_FILE)) {
        fs.unlinkSync(LOCK_FILE);
    }
    fs.watch(inputPath, async (eventType) => {
        if (eventType === 'change') {
            if (fs.existsSync(LOCK_FILE)) {
                return;
            }
            fs.writeFileSync(LOCK_FILE, 'locked');
            console.log(`${inputPath} has been changed. Exporting to HTML...`);
            await exportHtml(inputPath);
            fs.unlinkSync(LOCK_FILE);
        }
    });
}

module.exports = { exportPdf, initArch, exportHtml, watch, initADR };

