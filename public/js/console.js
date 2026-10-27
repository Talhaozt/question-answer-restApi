const endpoints = [
    {
        group: 'Overview',
        items: [
            { id: 'root', title: 'API root', method: 'GET', path: '/api', desc: 'Lists available resources.', auth: false }
        ]
    },
    {
        group: 'Auth',
        items: [
            { id: 'register', title: 'Register', method: 'POST', path: '/api/auth/register', desc: 'Create a user. Role cannot be set from the client.', auth: false, json: { name: 'Ada Lovelace', email: 'ada@example.com', password: 'secret12' } },
            { id: 'login', title: 'Login', method: 'POST', path: '/api/auth/login', desc: 'Returns JWT as acces_token.', auth: false, json: { email: 'questionanswer.info@gmail.com', password: '123456' } },
            { id: 'profile', title: 'Profile', method: 'GET', path: '/api/auth/profile', desc: 'Current authenticated user.', auth: true },
            { id: 'edit-user', title: 'Edit details', method: 'PUT', path: '/api/auth/edit', desc: 'Update name, email, title, about, place, website.', auth: true, json: { title: 'Backend engineer', place: 'Istanbul' } },
            { id: 'logout', title: 'Logout', method: 'GET', path: '/api/auth/logout', desc: 'Clears the access cookie.', auth: true },
            { id: 'forgot', title: 'Forgot password', method: 'POST', path: '/api/auth/forgotpassword', desc: 'Sends a reset mail if SMTP is configured.', auth: false, json: { email: 'ada@example.com' } },
            { id: 'reset', title: 'Reset password', method: 'PUT', path: '/api/auth/resetpassword', desc: 'Token arrives as a query parameter from email.', auth: false, query: { resetPasswordToken: '' }, json: { password: 'newpass12' } },
            { id: 'upload', title: 'Upload avatar', method: 'POST', path: '/api/auth/upload', desc: 'multipart/form-data field: profile_image.', auth: true, file: true }
        ]
    },
    {
        group: 'Questions',
        items: [
            { id: 'q-list', title: 'List questions', method: 'GET', path: '/api/questions', desc: 'Supports search, sortBy=most-liked|most-answered, page, limit.', auth: false, query: { search: '', sortBy: 'most-liked', page: '1', limit: '5' } },
            { id: 'q-ask', title: 'Ask question', method: 'POST', path: '/api/questions/ask', desc: 'Title min 10, content min 20 characters.', auth: true, json: { title: 'How does JWT auth work here?', content: 'Explain token generation, cookie and Bearer header usage in this API.' } },
            { id: 'q-one', title: 'Get question', method: 'GET', path: '/api/questions/:id', desc: 'Single question with sliced answers.', auth: false, params: { id: '' } },
            { id: 'q-edit', title: 'Edit question', method: 'PUT', path: '/api/questions/:id/edit', desc: 'Owner only.', auth: true, params: { id: '' }, json: { title: 'Updated question title here', content: 'Updated content must stay at least twenty characters.' } },
            { id: 'q-like', title: 'Like question', method: 'GET', path: '/api/questions/:id/like', desc: 'Authenticated like. Duplicate likes are rejected.', auth: true, params: { id: '' } },
            { id: 'q-unlike', title: 'Undo like', method: 'GET', path: '/api/questions/:id/undo_like', desc: 'Removes your like.', auth: true, params: { id: '' } },
            { id: 'q-del', title: 'Delete question', method: 'DELETE', path: '/api/questions/:id/delete', desc: 'Owner only. Answers are removed with the question.', auth: true, params: { id: '' } }
        ]
    },
    {
        group: 'Answers',
        items: [
            { id: 'a-list', title: 'List answers', method: 'GET', path: '/api/questions/:question_id/answers', desc: 'All answers of a question.', auth: false, params: { question_id: '' } },
            { id: 'a-add', title: 'Add answer', method: 'POST', path: '/api/questions/:question_id/answers', desc: 'Creates an answer and updates answersCount.', auth: true, params: { question_id: '' }, json: { content: 'JWT is signed with JWT_SECRET_KEY and sent as Bearer token.' } },
            { id: 'a-one', title: 'Get answer', method: 'GET', path: '/api/questions/:question_id/answers/:answer_id', desc: 'Populates question title and user.', auth: false, params: { question_id: '', answer_id: '' } },
            { id: 'a-edit', title: 'Edit answer', method: 'PUT', path: '/api/questions/:question_id/answers/:answer_id/edit', desc: 'Answer owner only.', auth: true, params: { question_id: '', answer_id: '' }, json: { content: 'Updated answer content goes here.' } },
            { id: 'a-like', title: 'Like answer', method: 'GET', path: '/api/questions/:question_id/answers/:answer_id/like', desc: 'Authenticated like.', auth: true, params: { question_id: '', answer_id: '' } },
            { id: 'a-unlike', title: 'Undo answer like', method: 'GET', path: '/api/questions/:question_id/answers/:answer_id/undoLike', desc: 'Removes your answer like.', auth: true, params: { question_id: '', answer_id: '' } },
            { id: 'a-del', title: 'Delete answer', method: 'DELETE', path: '/api/questions/:question_id/answers/:answer_id/delete', desc: 'Owner only.', auth: true, params: { question_id: '', answer_id: '' } }
        ]
    },
    {
        group: 'Users & Admin',
        items: [
            { id: 'u-list', title: 'List users', method: 'GET', path: '/api/users', desc: 'search, page and limit query params.', auth: false, query: { search: '', page: '1', limit: '5' } },
            { id: 'u-one', title: 'Get user', method: 'GET', path: '/api/users/:id', desc: 'Public user profile.', auth: false, params: { id: '' } },
            { id: 'adm-block', title: 'Block / unblock', method: 'GET', path: '/api/admin/block/:id', desc: 'Admin only toggle.', auth: true, params: { id: '' } },
            { id: 'adm-del', title: 'Delete user', method: 'DELETE', path: '/api/admin/user/:id', desc: 'Admin only. Cascades questions and answers.', auth: true, params: { id: '' } }
        ]
    }
];

const catalog = document.getElementById('catalog');
const fieldsEl = document.getElementById('fields');
const form = document.getElementById('requestForm');
const tokenInput = document.getElementById('token');
const statusChip = document.getElementById('statusChip');
const timingEl = document.getElementById('timing');
const responseBody = document.getElementById('responseBody');

let current = endpoints[0].items[0];
tokenInput.value = localStorage.getItem('qa_token') || '';

const renderCatalog = () => {
    catalog.innerHTML = endpoints.map((group) => `
        <div class="group">
            <h2>${group.group}</h2>
            ${group.items.map((item) => `
                <button class="endpoint ${item.id === current.id ? 'active' : ''}" data-id="${item.id}" type="button">
                    <span class="method ${item.method}">${item.method}</span>
                    <span>${item.title}</span>
                </button>
            `).join('')}
        </div>
    `).join('');
};

const field = (name, label, value = '', type = 'text') => `
    <div class="field">
        <label for="${name}">${label}</label>
        ${type === 'textarea'
            ? `<textarea id="${name}" name="${name}">${value}</textarea>`
            : `<input id="${name}" name="${name}" type="${type}" value="${value}">`}
    </div>
`;

const renderEndpoint = () => {
    document.getElementById('methodBadge').className = `method ${current.method}`;
    document.getElementById('methodBadge').textContent = current.method;
    document.getElementById('endpointTitle').textContent = current.title;
    document.getElementById('endpointDesc').textContent = current.desc + (current.auth ? ' Requires Authorization: Bearer <token>.' : '');
    document.getElementById('endpointPath').textContent = `${current.method} ${current.path}`;

    let html = '';
    if (current.params) {
        Object.keys(current.params).forEach((key) => {
            html += field(key, `Path :${key}`, current.params[key]);
        });
    }
    if (current.query) {
        Object.keys(current.query).forEach((key) => {
            html += field(`query_${key}`, `Query ${key}`, current.query[key]);
        });
    }
    if (current.json) {
        html += field('jsonBody', 'JSON body', JSON.stringify(current.json, null, 2), 'textarea');
    }
    if (current.file) {
        html += field('profile_image', 'profile_image file', '', 'file');
    }
    fieldsEl.innerHTML = html || '<p class="muted">No parameters for this request.</p>';
};

const buildUrl = () => {
    let path = current.path;
    if (current.params) {
        Object.keys(current.params).forEach((key) => {
            const value = document.getElementById(key)?.value.trim();
            path = path.replace(`:${key}`, encodeURIComponent(value || `:${key}`));
        });
    }
    const search = new URLSearchParams();
    if (current.query) {
        Object.keys(current.query).forEach((key) => {
            const value = document.getElementById(`query_${key}`)?.value.trim();
            if (value) search.set(key, value);
        });
    }
    const qs = search.toString();
    return qs ? `${path}?${qs}` : path;
};

const buildCurl = () => {
    const headers = ['-H "Content-Type: application/json"'];
    if (current.auth && tokenInput.value) {
        headers.push(`-H "Authorization: Bearer ${tokenInput.value}"`);
    }
    let cmd = `curl -X ${current.method} "${location.origin}${buildUrl()}" ${headers.join(' ')}`;
    if (current.json) {
        const body = document.getElementById('jsonBody')?.value || '{}';
        cmd += ` -d '${body.replace(/'/g, "'\\''")}'`;
    }
    return cmd;
};

const pretty = (value) => {
    try {
        return JSON.stringify(typeof value === 'string' ? JSON.parse(value) : value, null, 2);
    } catch {
        return String(value);
    }
};

catalog.addEventListener('click', (event) => {
    const button = event.target.closest('.endpoint');
    if (!button) return;
    current = endpoints.flatMap((group) => group.items).find((item) => item.id === button.dataset.id);
    renderCatalog();
    renderEndpoint();
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const url = buildUrl();
    const headers = {};
    if (tokenInput.value) headers.Authorization = `Bearer ${tokenInput.value}`;

    const options = { method: current.method, headers };

    if (current.file) {
        const file = document.getElementById('profile_image')?.files[0];
        const body = new FormData();
        if (file) body.append('profile_image', file);
        options.body = body;
    } else if (current.json) {
        headers['Content-Type'] = 'application/json';
        options.body = document.getElementById('jsonBody').value;
    }

    statusChip.textContent = 'sending';
    statusChip.className = 'chip';
    const started = performance.now();

    try {
        const response = await fetch(url, options);
        const text = await response.text();
        const elapsed = Math.round(performance.now() - started);
        statusChip.textContent = `${response.status} ${response.statusText}`;
        statusChip.className = `chip ${response.ok ? 'ok' : 'err'}`;
        timingEl.textContent = `${elapsed} ms`;
        responseBody.textContent = pretty(text);

        try {
            const parsed = JSON.parse(text);
            if (parsed.acces_token) {
                tokenInput.value = parsed.acces_token;
                localStorage.setItem('qa_token', parsed.acces_token);
            }
        } catch (_err) {
            /* non-JSON response */
        }
    } catch (error) {
        statusChip.textContent = 'failed';
        statusChip.className = 'chip err';
        responseBody.textContent = error.message;
    }
});

document.getElementById('copyCurl').addEventListener('click', async () => {
    await navigator.clipboard.writeText(buildCurl());
    document.getElementById('copyCurl').textContent = 'Copied';
    setTimeout(() => { document.getElementById('copyCurl').textContent = 'Copy cURL'; }, 1200);
});

document.getElementById('clearToken').addEventListener('click', () => {
    tokenInput.value = '';
    localStorage.removeItem('qa_token');
});

tokenInput.addEventListener('change', () => {
    localStorage.setItem('qa_token', tokenInput.value);
});

renderCatalog();
renderEndpoint();
