const fs = require('fs');
const path = require('path');

// Load environment variables
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || 'securepro-assets-zxyw1y';
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || '';
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

// Reconstruct global store
const globalKeys = {};

// Also try loading from local .env if present
try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split(/\r?\n/).forEach(line => {
            const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
                if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
                
                globalKeys[key] = value;
            }
        });
    }
} catch (_) {}

const keys = {
    AWS_ACCESS_KEY_ID: globalKeys.AWS_ACCESS_KEY_ID || AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: globalKeys.AWS_SECRET_ACCESS_KEY || AWS_SECRET_ACCESS_KEY,
    AWS_REGION: globalKeys.AWS_REGION || AWS_REGION,
    AWS_S3_BUCKET: globalKeys.AWS_S3_BUCKET || AWS_S3_BUCKET,
    EMAILJS_PUBLIC_KEY: globalKeys.EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY,
    EMAILJS_SERVICE_ID: globalKeys.EMAILJS_SERVICE_ID || EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID: globalKeys.EMAILJS_TEMPLATE_ID || EMAILJS_TEMPLATE_ID,
    GROQ_API_KEY: globalKeys.GROQ_API_KEY || GROQ_API_KEY,
    SMTP_USER: globalKeys.SMTP_USER || SMTP_USER,
    SMTP_PASS: globalKeys.SMTP_PASS || SMTP_PASS
};

console.log('[SECRETS-INJECTOR] Resolving credentials for static compilation...');

const filesToInject = [
    path.join(__dirname, 'js', 'config.js'),
    path.join(__dirname, 'config', 'config.js')
];

filesToInject.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
        console.warn(`[SECRETS-INJECTOR] File not found: ${filePath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the dynamic let declarations
    content = content.replace(/let\s+accessKeyId\s*=\s*process\.env\.AWS_ACCESS_KEY_ID\s*\|\|\s*'';/g, `let accessKeyId = '${keys.AWS_ACCESS_KEY_ID}';`);
    content = content.replace(/let\s+secretAccessKey\s*=\s*process\.env\.AWS_SECRET_ACCESS_KEY\s*\|\|\s*'';/g, `let secretAccessKey = '${keys.AWS_SECRET_ACCESS_KEY}';`);
    content = content.replace(/let\s+awsRegion\s*=\s*process\.env\.AWS_REGION\s*\|\|\s*'us-east-1';/g, `let awsRegion = '${keys.AWS_REGION}';`);
    content = content.replace(/let\s+s3BucketName\s*=\s*process\.env\.AWS_S3_BUCKET\s*\|\|\s*process\.env\.S3_BUCKET\s*\|\|\s*'securepro-assets-zxyw1y';/g, `let s3BucketName = '${keys.AWS_S3_BUCKET}';`);
    
    content = content.replace(/let\s+EMAILJS_PUBLIC_KEY\s*=\s*process\.env\.EMAILJS_PUBLIC_KEY\s*\|\|\s*'';/g, `let EMAILJS_PUBLIC_KEY = '${keys.EMAILJS_PUBLIC_KEY}';`);
    content = content.replace(/let\s+EMAILJS_SERVICE_ID\s*=\s*process\.env\.EMAILJS_SERVICE_ID\s*\|\|\s*'';/g, `let EMAILJS_SERVICE_ID = '${keys.EMAILJS_SERVICE_ID}';`);
    content = content.replace(/let\s+EMAILJS_TEMPLATE_ID\s*=\s*process\.env\.EMAILJS_TEMPLATE_ID\s*\|\|\s*'';/g, `let EMAILJS_TEMPLATE_ID = '${keys.EMAILJS_TEMPLATE_ID}';`);
    
    content = content.replace(/let\s+GROQ_API_KEY\s*=\s*process\.env\.GROQ_API_KEY\s*\|\|\s*'';/g, `let GROQ_API_KEY = '${keys.GROQ_API_KEY}';`);
    
    content = content.replace(/let\s+SMTP_USER\s*=\s*process\.env\.SMTP_USER\s*\|\|\s*'';/g, `let SMTP_USER = '${keys.SMTP_USER}';`);
    content = content.replace(/let\s+SMTP_PASS\s*=\s*process\.env\.SMTP_PASS\s*\|\|\s*'';/g, `let SMTP_PASS = '${keys.SMTP_PASS}';`);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[SECRETS-INJECTOR] Successfully injected credentials into: ${path.basename(filePath)}`);
});
