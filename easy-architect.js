const { mdToPdf } = require('md-to-pdf');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const marked = require('marked');

async function convert(inputPath, intermediatePath, tempDir) {
    const { run } = await import("@mermaid-js/mermaid-cli");
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir);
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

async function init() {
    const name = await askQuestion("Enter project name: ");
    const version = await askQuestion("Enter project version: ");
    const author = await askQuestion("Enter author name: ");
    const today = new Date().toISOString().split('T')[0];

    const templatePath = path.join(__dirname, 'template.md');
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

async function exportHtml(inputPath) {
    const fileName = path.basename(inputPath, '.md');
    const tempDir = `${fileName}_tmp`;
    const intermediatePath = path.join(tempDir, 'test.out.md');
    const outputPath = path.join(tempDir, `${fileName}.html`);

    await convert(inputPath, intermediatePath, tempDir);

    const markdownContent = fs.readFileSync(intermediatePath, 'utf8');

    const htmlContent = marked.parse(markdownContent);
    const fullHtmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${fileName}</title>
    </head>
    <body>
        ${htmlContent}
    </body>
    </html>
    `;

    fs.writeFileSync(outputPath, fullHtmlContent);

    console.log(`HTML file created successfully at ${outputPath}`);
}

async function exportPdf(inputPath) {
    const fileName = path.basename(inputPath, '.md');
    const tempDir = `${fileName}_tmp`;
    const intermediatePath = path.join(tempDir, 'test.out.md');
    const outputPath = path.join(path.dirname(inputPath), `${fileName}.pdf`);

    await convert(inputPath, intermediatePath, tempDir);

    await mdToPdf({ path: intermediatePath }, { dest: outputPath });

    fs.rmSync(tempDir, { recursive: true, force: true });
}

module.exports = { exportPdf, init, exportHtml };

