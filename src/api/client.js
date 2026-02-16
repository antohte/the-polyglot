const API_URL = '/api';

const getHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'API request failed');
    }
    return response.json();
};

export const api = {
    auth: {
        login: (email, password) => fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        }).then(handleResponse),
        signup: (data) => fetch(`${API_URL}/auth/signup`, { // data: {email, password, full_name}
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(handleResponse),
        me: () => fetch(`${API_URL}/auth/me`, {
            headers: getHeaders()
        }).then(handleResponse)
    },
    upload: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('auth_token');
        return fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: formData
        }).then(handleResponse);
    },
    // Users
    users: {
        getAll: () => fetch(`${API_URL}/users`, { headers: getHeaders() }).then(handleResponse),
        get: (id) => fetch(`${API_URL}/users/${id}`, { headers: getHeaders() }).then(handleResponse),
        update: (id, data) => fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),
        delete: (id) => fetch(`${API_URL}/users/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
        // Friends
        getFriends: (id) => fetch(`${API_URL}/users/${id}/friends`, { headers: getHeaders() }).then(handleResponse),
        getPendingRequests: (id) => fetch(`${API_URL}/users/${id}/friends/requests`, { headers: getHeaders() }).then(handleResponse),
        sendFriendRequest: (id, targetId) => fetch(`${API_URL}/users/${id}/friends/request`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ target_id: targetId })
        }).then(handleResponse),
        acceptFriendRequest: (id, requesterId) => fetch(`${API_URL}/users/${id}/friends/accept`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ requester_id: requesterId })
        }).then(handleResponse),
        removeFriend: (id, friendId) => fetch(`${API_URL}/users/${id}/friends/${friendId}`, {
            method: 'DELETE',
            headers: getHeaders()
        }).then(handleResponse),
        getFriendStatus: (id, targetId) => fetch(`${API_URL}/users/${id}/friends/status/${targetId}`, { headers: getHeaders() }).then(handleResponse),
    },

    // Posts
    posts: {
        getAll: (filters = {}) => {
            const q = new URLSearchParams(filters).toString();
            return fetch(`${API_URL}/posts?${q}`, { headers: getHeaders() }).then(handleResponse);
        },
        get: (id) => fetch(`${API_URL}/posts/${id}`, { headers: getHeaders() }).then(handleResponse),
        create: (data) => fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),
        update: (id, data) => fetch(`${API_URL}/posts/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),
        delete: (id) => fetch(`${API_URL}/posts/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
        // Comments & Likes
        getComments: (id) => fetch(`${API_URL}/posts/${id}/comments`, { headers: getHeaders() }).then(handleResponse),
        addComment: (id, data) => fetch(`${API_URL}/posts/${id}/comments`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),
        getLikes: (id) => fetch(`${API_URL}/posts/${id}/likes`, { headers: getHeaders() }).then(handleResponse),
        toggleLike: (id, userId) => fetch(`${API_URL}/posts/${id}/like`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ user_id: userId })
        }).then(handleResponse),
    },

    // Categories
    categories: {
        getAll: () => fetch(`${API_URL}/categories`, { headers: getHeaders() }).then(handleResponse),
        create: (data) => fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),
        request: (data) => fetch(`${API_URL}/categories/requests`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),
        getRequests: () => fetch(`${API_URL}/categories/requests`, { headers: getHeaders() }).then(handleResponse),
        approveRequest: (id) => fetch(`${API_URL}/categories/requests/${id}/approve`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
        rejectRequest: (id) => fetch(`${API_URL}/categories/requests/${id}/reject`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
        delete: (id) => fetch(`${API_URL}/categories/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
    },

    // Subcategories
    subcategories: {
        getByCategory: (categoryId) => fetch(`${API_URL}/subcategories/category/${categoryId}`, { headers: getHeaders() }).then(handleResponse),
        create: (data) => fetch(`${API_URL}/subcategories`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),
        update: (id, data) => fetch(`${API_URL}/subcategories/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),
        delete: (id) => fetch(`${API_URL}/subcategories/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
    },

    // Events
    events: {
        getAll: () => fetch(`${API_URL}/events`, { headers: getHeaders() }).then(handleResponse),
        create: (data) => fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),
        update: (id, data) => fetch(`${API_URL}/events/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),
        delete: (id) => fetch(`${API_URL}/events/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
    },

    // Polls
    polls: {
        getAll: () => fetch(`${API_URL}/polls`, { headers: getHeaders() }).then(handleResponse),
        create: (data) => fetch(`${API_URL}/polls`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),
        vote: (id, userId, optionId) => fetch(`${API_URL}/polls/${id}/vote`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ user_id: userId, option_id: optionId })
        }).then(handleResponse),
        delete: (id) => fetch(`${API_URL}/polls/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
    },

    // Stats
    stats: {
        get: () => fetch(`${API_URL}/stats`, { headers: getHeaders() }).then(handleResponse)
    },

    // Reports
    reports: {
        getAll: () => fetch(`${API_URL}/reports`, { headers: getHeaders() }).then(handleResponse),
        create: (data) => fetch(`${API_URL}/reports`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),
        resolve: (id, action) => fetch(`${API_URL}/reports/${id}/resolve`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ action })
        }).then(handleResponse),
    },

    // Settings
    settings: {
        getAll: () => fetch(`${API_URL}/settings`, { headers: getHeaders() }).then(handleResponse),
        update: (data) => fetch(`${API_URL}/settings`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),
    }
};
