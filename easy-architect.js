const { mdToPdf } = require('md-to-pdf');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

let FILE_CHANGE_CAPTURED = false;

async function convert(inputPath, intermediatePath, tempDir) {
    const { run } = await import("@mermaid-js/mermaid-cli");
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir);

    // Add "../" prefix to local links
    let content = fs.readFileSync(inputPath, 'utf8');
    content = content.replace(/\]\((?!http)([^)]+)\)/g, '](../$1)');
    fs.writeFileSync(inputPath, content);

    await run(
        inputPath, intermediatePath, // {optional options},
    );

    console.log(`Converted MD created successfully at ${intermediatePath}`);
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
    const outputPath = path.join(path.dirname(inputPath), `${fileName}.pdf`);

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

    fs.rmSync(tempDir, { recursive: true, force: true });
}

async function watch(inputPath) {
    fs.watch(inputPath, async (eventType) => {
        if (eventType === 'change') {
            if (FILE_CHANGE_CAPTURED) {
                console.log('File change already captured. Skipping...');
                return;
            }
            FILE_CHANGE_CAPTURED = true;
            console.log(`${inputPath} has been changed. Exporting to HTML...`);
            await exportHtml(inputPath);
            FILE_CHANGE_CAPTURED = false;
        }
    });
}

module.exports = { exportPdf, initArch, exportHtml, watch, initADR };

