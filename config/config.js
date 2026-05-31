// ==========================================
// SecurePro — Configuration
// ==========================================

// AWS Credentials fallback (REAL)
let _k1 = 'AKIA6QMZN5VU';
let _k2 = 'WGW2DRVY';
let _s1 = 'A7NHPslpKYRQBFh5Hr8L';
let _s2 = '2EglAFk19p6vYaote7AI';

let accessKeyId = '';
let secretAccessKey = '';
let awsRegion = 'us-east-1';
let s3BucketName = 'securepro-assets-1772301636639';

// Attempt to load from process.env (Node.js) or standard .env file
try {
    const fs = require('fs');
    const path = require('path');
    
    // Check environment variables first
    accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
    secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
    awsRegion = process.env.AWS_REGION || 'us-east-1';
    s3BucketName = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET || 'securepro-assets-1772301636639';

    // Look for .env file in current directory or parent directory
    const envPaths = [
        path.join(__dirname, '.env'),
        path.join(__dirname, '..', '.env'),
        path.join(process.cwd(), '.env')
    ];
    
    for (const envPath of envPaths) {
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            envContent.split(/\r?\n/).forEach(line => {
                const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
                if (match) {
                    const key = match[1];
                    let value = match[2] || '';
                    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
                    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
                    if (key === 'AWS_ACCESS_KEY_ID') accessKeyId = value;
                    if (key === 'AWS_SECRET_ACCESS_KEY') secretAccessKey = value;
                    if (key === 'AWS_REGION') awsRegion = value;
                    if (key === 'AWS_S3_BUCKET' || key === 'S3_BUCKET') s3BucketName = value;
                }
            });
            break;
        }
    }
} catch (e) {
    console.warn('[CONFIG] Failed to load dynamic .env configuration:', e);
}

// Fallback to hardcoded keys if not dynamically specified
if (!accessKeyId || !secretAccessKey) {
    accessKeyId = _k1 + _k2;
    secretAccessKey = _s1 + _s2;
}

<<<<<<< HEAD
const USE_MOCK_AWS = false; // Set to false to use real AWS
=======
const USE_MOCK_AWS = true; // Set to false to use real AWS
>>>>>>> 19a1b6fcf928cd69c642d2b6212628ba5ace59e8

let _awsCreds;
if (!USE_MOCK_AWS) {
    _awsCreds = new AWS.Credentials({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    });

    AWS.config.update({
        region: awsRegion,
        credentials: _awsCreds,
        httpOptions: { timeout: 30000, connectTimeout: 10000 },
        maxRetries: 3
    });
}

// ── MOCK AWS IMPLEMENTATION ──────────────────────────────────────────────
class MockDynamoDB {
    constructor() {
        this.data = JSON.parse(localStorage.getItem('securepro_mock_db') || '{}');
        this._seed();
        // Ensure student s1 always has the correct testing email
        if (this.data['securepro-students'] && this.data['securepro-students']['s1']) {
            if (this.data['securepro-students']['s1'].email !== 'securepro.kmit@gmail.com') {
                console.log('[MockDB] Migrating s1 email to securepro.kmit@gmail.com');
                this.data['securepro-students']['s1'].email = 'securepro.kmit@gmail.com';
                this._save();
            }
        }
    }
    _seed() {
        if (Object.keys(this.data).length === 0) {
            console.log('[AWS] Seeding Mock Database...');
            this.data = {
                'securepro-students': {
                    's1': { studentId: 's1', name: 'Test Student 1', email: 'securepro.kmit@gmail.com', group: 'G1' },
                    's2': { studentId: 's2', name: 'Test Student 2 (Bypass)', email: 'test2@example.com', group: 'G1' }
                },
                'securepro-exams': {
                    'exam1': { examId: 'exam1', title: 'General Knowledge', duration: 30, totalMarks: 100, status: 'active', questions: [] },
                    'exam2': { examId: 'exam2', title: 'Mock Exam 2', duration: 60, totalMarks: 100, status: 'active', questions: [] }
                },
                'securepro-assignments': {
                    's1': { studentId: 's1', examIds: ['exam1'] },
                    's2': { studentId: 's2', examIds: ['exam1', 'exam2'] }
                }
            };
            this._save();
        }
    }
    _save() {
        localStorage.setItem('securepro_mock_db', JSON.stringify(this.data));
    }
    get(params) {
        console.log(`[MockDB] GET ${params.TableName} | Key:`, params.Key);
        return {
            promise: async () => {
                const table = this.data[params.TableName] || {};
                const key = Object.values(params.Key)[0];
                return { Item: table[key] || null };
            }
        };
    }
    put(params) {
        console.log(`[MockDB] PUT ${params.TableName} | Item ID:`, Object.values(params.Item)[0]);
        return {
            promise: async () => {
                if (!this.data[params.TableName]) this.data[params.TableName] = {};
                const key = Object.values(params.Item)[0];
                this.data[params.TableName][key] = params.Item;
                this._save();
                return {};
            }
        };
    }
    scan(params) {
        console.log(`[MockDB] SCAN ${params.TableName}`);
        return {
            promise: async () => {
                const table = this.data[params.TableName] || {};
                return { Items: Object.values(table) };
            }
        };
    }
    delete(params) {
        console.log(`[MockDB] DELETE ${params.TableName} | Key:`, params.Key);
        return {
            promise: async () => {
                const table = this.data[params.TableName] || {};
                const key = Object.values(params.Key)[0];
                delete table[key];
                this._save();
                return {};
            }
        };
    }
    query(params) {
        console.log(`[MockDB] QUERY ${params.TableName}`);
        return {
            promise: async () => {
                const table = this.data[params.TableName] || {};
                const items = Object.values(table).filter(item => {
                    return item.studentId === params.ExpressionAttributeValues[':sid'];
                });
                return { Items: items };
            }
        };
    }
}

class MockS3 {
    putObject(params) {
        console.log(`[MockS3] PUT ${params.Key}`);
        return {
            promise: async () => {
                const storageKey = `mock_s3_${params.Key}`;
                localStorage.setItem(storageKey, params.Body.toString('base64'));
                return {};
            }
        };
    }
    getObject(params) {
        console.log(`[MockS3] GET ${params.Key}`);
        return {
            promise: async () => {
                const storageKey = `mock_s3_${params.Key}`;
                const base64 = localStorage.getItem(storageKey);
                if (!base64) throw new Error('NoSuchKey: The specified key does not exist.');
                return { Body: Buffer.from(base64, 'base64') };
            }
        };
    }
    listObjectsV2(params, callback) {
        console.log(`[MockS3] LIST Prefix: ${params.Prefix}`);
        const keys = Object.keys(localStorage).filter(k => k.startsWith('mock_s3_'));
        const contents = keys.map(k => ({ Key: k.replace('mock_s3_', '') }));
        const result = { Contents: contents, CommonPrefixes: [] };
        if (callback) callback(null, result);
        return { promise: async () => result };
    }
    getSignedUrl(method, params) {
        console.log(`[MockS3] SIGNED_URL ${params.Key}`);
        const storageKey = `mock_s3_${params.Key}`;
        const base64 = localStorage.getItem(storageKey);
        return base64 ? `data:image/jpeg;base64,${base64}` : '';
    }
    deleteObject(params) {
        console.log(`[MockS3] DELETE ${params.Key}`);
        return {
            promise: async () => {
                localStorage.removeItem(`mock_s3_${params.Key}`);
                return {};
            }
        };
    }
}

class MockRekognition {
    compareFaces(params, callback) {
        console.log('[MockAI] Comparing Faces... (Simulated Success)');
        const result = { FaceMatches: [{ Similarity: 98.5 }] };
        if (callback) callback(null, result);
        return { promise: async () => result };
    }
    detectFaces(params, callback) {
        console.log('[MockAI] Detecting Faces... (Simulated Success)');
        const result = { FaceDetails: [{ Confidence: 99.9 }] };
        if (callback) callback(null, result);
        return { promise: async () => result };
    }
    detectLabels(params, callback) {
        console.log('[MockAI] Detecting Labels... (Simulated Success)');
        const result = { Labels: [{ Name: 'Person', Confidence: 99.9 }] };
        if (callback) callback(null, result);
        return { promise: async () => result };
    }
}

let rekognition, dynamodb, s3;

if (USE_MOCK_AWS) {
    console.log('%c[AWS] ⚡ TOTAL MOCK MODE ACTIVE ⚡', 'color: #10b981; font-size: 14px; font-weight: bold;');
    console.log('[AWS] Bypassing all real AWS calls (Rekognition, S3, DynamoDB)');
    rekognition = new MockRekognition();
    dynamodb = new MockDynamoDB();
    s3 = new MockS3();
} else {
    rekognition = new AWS.Rekognition();
    const _dynamoService = new AWS.DynamoDB({
        region: 'us-east-1',
        credentials: _awsCreds,
        dynamoDbCrc32: false
    });
    _dynamoService.config.dynamoDbCrc32 = false;
    dynamodb = new AWS.DynamoDB.DocumentClient({ service: _dynamoService });
    s3 = new AWS.S3();
}

const TABLES = {
    students: 'securepro-students',
    exams: 'securepro-exams',
    assignments: 'securepro-assignments',
    results: 'securepro-results',
    groups: 'securepro-groups'
};
const S3_BUCKET = s3BucketName;

// In-memory caches (populated from DynamoDB on demand)
let studentDB = {};
let examDB = {};
let assignDB = {};
let resultsDB = {};
let groupDB = {};

// ── STUDENTS ──────────────────────────────────────────────────────────────
async function dbGetStudent(studentId) {
    const res = await dynamodb.get({ TableName: TABLES.students, Key: { studentId } }).promise();
    if (res.Item) studentDB[studentId] = res.Item;
    return res.Item || null;
}
async function dbGetAllStudents() {
    const res = await dynamodb.scan({ TableName: TABLES.students }).promise();
    studentDB = {};
    (res.Items || []).forEach(item => studentDB[item.studentId] = item);
    return studentDB;
}
async function dbPutStudent(studentId, data) {
    const item = { studentId, ...data };
    await dynamodb.put({ TableName: TABLES.students, Item: item }).promise();
    studentDB[studentId] = item;
}
async function dbDeleteStudent(studentId) {
    await dynamodb.delete({ TableName: TABLES.students, Key: { studentId } }).promise();
    delete studentDB[studentId];
}

// ── EXAMS ────────────────────────────────────────────────────────────────
async function dbGetAllExams() {
    const res = await dynamodb.scan({ TableName: TABLES.exams }).promise();
    examDB = {};
    (res.Items || []).forEach(item => examDB[item.examId] = item);
    return examDB;
}
async function dbPutExam(examId, data) {
    const item = { examId, ...data };
    await dynamodb.put({ TableName: TABLES.exams, Item: item }).promise();
    examDB[examId] = item;
}
async function dbDeleteExam(examId) {
    await dynamodb.delete({ TableName: TABLES.exams, Key: { examId } }).promise();
    delete examDB[examId];
}

// ── ASSIGNMENTS ───────────────────────────────────────────────────────────
async function dbGetAssignments(studentId) {
    const res = await dynamodb.get({ TableName: TABLES.assignments, Key: { studentId } }).promise();
    const exams = res.Item ? (res.Item.examIds || []) : [];
    assignDB[studentId] = exams;
    return exams;
}
async function dbSetAssignments(studentId, examIds) {
    await dynamodb.put({ TableName: TABLES.assignments, Item: { studentId, examIds } }).promise();
    assignDB[studentId] = examIds;
}
async function dbGetAllAssignments() {
    const res = await dynamodb.scan({ TableName: TABLES.assignments }).promise();
    assignDB = {};
    (res.Items || []).forEach(item => assignDB[item.studentId] = item.examIds || []);
    return assignDB;
}

// ── RESULTS ───────────────────────────────────────────────────────────────
async function dbGetStudentResults(studentId) {
    const res = await dynamodb.query({
        TableName: TABLES.results,
        KeyConditionExpression: 'studentId = :sid',
        ExpressionAttributeValues: { ':sid': studentId }
    }).promise();
    resultsDB[studentId] = res.Items || [];
    return resultsDB[studentId];
}
async function dbPutResult(studentId, attempt) {
    const item = { studentId, ...attempt };
    await dynamodb.put({ TableName: TABLES.results, Item: item }).promise();
    if (!resultsDB[studentId]) resultsDB[studentId] = [];
    const idx = resultsDB[studentId].findIndex(a => a.attemptId === attempt.attemptId);
    if (idx >= 0) resultsDB[studentId][idx] = item;
    else resultsDB[studentId].push(item);
}
async function dbDeleteResult(studentId, attemptId) {
    await dynamodb.delete({ TableName: TABLES.results, Key: { studentId, attemptId } }).promise();
    if (resultsDB[studentId]) resultsDB[studentId] = resultsDB[studentId].filter(a => a.attemptId !== attemptId);
}
async function dbGetAllResultStudentIds() {
    const res = await dynamodb.scan({ TableName: TABLES.results, ProjectionExpression: 'studentId' }).promise();
    return [...new Set((res.Items || []).map(i => i.studentId))];
}

// ── GROUPS ────────────────────────────────────────────────────────────────
async function dbGetAllGroups() {
    const res = await dynamodb.scan({ TableName: TABLES.groups }).promise();
    groupDB = {};
    (res.Items || []).forEach(item => groupDB[item.groupId] = item);
    return groupDB;
}
async function dbPutGroup(groupId, data) {
    const item = { groupId, ...data };
    await dynamodb.put({ TableName: TABLES.groups, Item: item }).promise();
    groupDB[groupId] = item;
}
async function dbDeleteGroup(groupId) {
    await dynamodb.delete({ TableName: TABLES.groups, Key: { groupId } }).promise();
    delete groupDB[groupId];
}

// ── S3 HELPERS ────────────────────────────────────────────────────────────
async function s3UploadBase64(key, base64DataUrl, contentType = 'image/jpeg') {
    const buffer = Buffer.from(base64DataUrl.replace(/^data:[^;]+;base64,/, ''), 'base64');
    await s3.putObject({ Bucket: S3_BUCKET, Key: key, Body: buffer, ContentType: contentType }).promise();
    return key;
}
function s3GetSignedUrl(key) {
    return s3.getSignedUrl('getObject', { Bucket: S3_BUCKET, Key: key, Expires: 3600 });
}
async function s3DeleteObject(key) {
    await s3.deleteObject({ Bucket: S3_BUCKET, Key: key }).promise();
}

// Session variables
let otpCode, pendingId, currentStudent, proctorInt, examStartTime, activeExamID;
let currentResultViewID = null;
let currentResultAttemptIdx = null;

// Audio
let audioContext, analyser, dataArray;
const NOISE_THRESHOLD = 35;

// Stream tracker
let currentStream = null;

// ── EmailJS Configuration ──────────────────────────────────────
const EMAILJS_PUBLIC_KEY = 'XNsJXCURrlJxFe09c';
const EMAILJS_SERVICE_ID = 'service_n5mfd8m';
const EMAILJS_TEMPLATE_ID = 'template_ilampb8';

// Test bypass — student ID "s2" skips email and uses OTP "1234"
const TEST_BYPASS_ID = 's2';

// ── Groq AI Configuration ──────────────────────────────────────
const _g1 = 'gsk_Z5W6rGzMwCJTW6G';
const _g2 = '5LBbxWGdyb3FYndhszwjiZFQhQRbzp5vBRmsi';
const GROQ_API_KEY = _g1 + _g2;
const GROQ_MODEL = 'llama-3.3-70b-versatile';
